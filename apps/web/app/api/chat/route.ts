import { openai } from '@ai-sdk/openai'
import OpenAI from 'openai'
import {
  streamText,
  convertToModelMessages,
  generateObject,
  stepCountIs,
  type UIMessage,
} from 'ai'

// Direct OpenAI client for embeddings (workaround for AI SDK v6 bug)
const openaiClient = new OpenAI()
import { createClientDb } from '@/utils/db/server'
import { z } from 'zod'

// Import types
import { type AgentContext } from '@/lib/agents/types'
import { DATABASE_SCHEMA, isReadOnlyQuery, sanitizeQuery } from '@/lib/agents/schema'

// =============================================================================
// SYSTEM PROMPT
// =============================================================================

const systemPrompt = `Eres un asistente academico de UADE llamado Titulin.
Ayudas a estudiantes con informacion sobre materias, correlativas y planificacion.
Responde en espanol, de forma clara y concisa.

REGLAS CRITICAS:
1. NUNCA inventes informacion. Solo usa datos de la base de datos.
2. Para cualquier consulta de datos -> USA consulta_sql
3. Para buscar temas especificos -> USA buscar_contenidos
4. Para ordenar materias pendientes -> USA ordenar_materias_pendientes
5. Si no encuentras la informacion, dilo claramente.

HERRAMIENTAS:
- consulta_sql: Genera y ejecuta queries SQL para obtener datos
- buscar_contenidos: Busqueda semantica de temas en materias
- ordenar_materias_pendientes: Ordena materias pendientes topologicamente (Khan)

ESQUEMA DE BASE DE DATOS:
- materias(id, codigo, nombre, anio, cuatrimestre, horas, carrera_id)
- correlativas(materia_id, correlativa_codigo, correlativa_materia_id)
- contenidos(id, materia_id, contenido, orden)
- carreras(id, nombre, facultad_id)`

// =============================================================================
// CONTEXT MANAGEMENT
// =============================================================================

interface ApprovedSubject {
  code: string
  name: string
  year: string
}

let currentContext: AgentContext | null = null

// =============================================================================
// MAIN HANDLER
// =============================================================================

export async function POST(req: Request) {
  const {
    messages,
    careerId: rawCareerId,
    approvedSubjects = [],
    maxYear = 5,
  }: {
    messages: UIMessage[]
    careerId?: string
    approvedSubjects?: ApprovedSubject[]
    maxYear?: number
  } = await req.json()

  const careerId = rawCareerId && rawCareerId.length > 0 ? rawCareerId : null
  const supabase = await createClientDb()

  // Build context for agents
  if (careerId) {
    currentContext = {
      careerId,
      approvedSubjects,
      maxYear,
      supabase,
    }
  }

  // Build dynamic system prompt with approved subjects
  const dynamicSystemPrompt = `${systemPrompt}

Materias aprobadas del estudiante:
${approvedSubjects.length > 0
    ? approvedSubjects.map(s => `- ${s.code}: ${s.name} (Ano ${s.year})`).join('\n')
    : 'Ninguna (estudiante nuevo)'
  }

Carrera ID: ${careerId || 'No especificada'}
Ano maximo de la carrera: ${maxYear}`

  const result = streamText({
    model: openai('gpt-5-mini'),
    system: dynamicSystemPrompt,
    messages: await convertToModelMessages(messages),

    // ==========================================================================
    // TOOLS
    // ==========================================================================
    tools: {
      // ========================================================================
      // TOOL: buscar_contenidos
      // ========================================================================
      buscar_contenidos: {
        description: `Busqueda semantica en los contenidos de las materias.
          USAR para: temas especificos como "materias que ensenan programacion" o "donde aprendo sobre bases de datos".
          Retorna materias relevantes con similitud.`,
        inputSchema: z.object({
          query: z.string().describe('Tema o concepto a buscar'),
        }),
        execute: async ({ query }: { query: string }) => {
          try {
            // Generate embedding using direct OpenAI client (workaround for AI SDK v6 bug)
            console.log('[buscar_contenidos] Generating embedding for:', query)
            const embedResponse = await openaiClient.embeddings.create({
              model: 'text-embedding-3-small',
              input: query,
            })

            const embedding = embedResponse.data[0]?.embedding
            if (!embedding || !Array.isArray(embedding)) {
              console.error('[buscar_contenidos] Invalid embedding result')
              return { error: 'Error generando embedding: resultado invalido', query }
            }

            console.log('[buscar_contenidos] Embedding generated, length:', embedding.length)

            // Search in database
            const { data, error } = await supabase.rpc('search_contenidos', {
              query_embedding: embedding,
              carrera_id_filter: careerId,
              match_threshold: 0.4,
              match_count: 5,
            })

            if (error) {
              console.error('[buscar_contenidos] Supabase error:', error)
              return { error: error.message, query }
            }

            console.log('[buscar_contenidos] Results found:', data?.length || 0)
            return { resultados: data || [], query }
          } catch (err) {
            console.error('[buscar_contenidos] Error:', err)
            return {
              error: err instanceof Error ? err.message : 'Error en busqueda semantica',
              query
            }
          }
        },
      },

      // ========================================================================
      // TOOL: consulta_sql
      // ========================================================================
      consulta_sql: {
        description: `Ejecuta una consulta SQL para obtener informacion de la base de datos.
          USAR SIEMPRE para: buscar materias, correlativas, estadisticas, estructura de carrera.
          Solo genera queries SELECT (read-only).

          TABLAS DISPONIBLES:
          - materias: id, codigo, nombre, anio, cuatrimestre, horas, carrera_id
          - correlativas: materia_id, correlativa_codigo, correlativa_materia_id
          - contenidos: id, materia_id, contenido, orden
          - carreras: id, nombre, facultad_id

          EJEMPLOS DE QUERIES:
          - Materias de un ano: SELECT * FROM materias WHERE carrera_id = 'X' AND anio = '2'
          - Correlativas: SELECT c.*, m.nombre FROM correlativas c JOIN materias m ON c.correlativa_materia_id = m.id
          - Materias que desbloquea: SELECT m.* FROM materias m JOIN correlativas c ON c.materia_id = m.id WHERE c.correlativa_codigo = 'X'`,
        inputSchema: z.object({
          pregunta: z.string().min(5)
            .describe('Pregunta en lenguaje natural sobre los datos'),
        }),
        execute: async ({ pregunta }: { pregunta: string }) => {
          if (!currentContext) {
            return { query: '', data: [], rowCount: 0, error: 'Sin contexto de carrera' }
          }

          try {
            // Generate SQL query using LLM
            const { object: queryObj } = await generateObject({
              model: openai('gpt-5-mini'),
              system: `${DATABASE_SCHEMA}

IMPORTANTE: La carrera_id es: '${currentContext.careerId}'
Siempre incluye este filtro en queries de materias.`,
              prompt: `Genera una query SQL SELECT para responder: "${pregunta}"`,
              schema: z.object({
                query: z.string().describe('Query SQL SELECT valida'),
                explanation: z.string().describe('Explicacion breve de la query'),
              }),
            })

            // Validate read-only
            if (!isReadOnlyQuery(queryObj.query)) {
              return {
                query: queryObj.query,
                data: [],
                rowCount: 0,
                error: 'Solo se permiten queries SELECT (read-only)',
              }
            }

            // Sanitize and execute
            const safeQuery = sanitizeQuery(queryObj.query, 50)

            // Use Supabase raw SQL (via RPC or direct)
            const { data, error } = await currentContext.supabase
              .rpc('execute_readonly_query', { sql_query: safeQuery })

            if (error) {
              return {
                query: safeQuery,
                data: [],
                rowCount: 0,
                error: error.message,
              }
            }

            return {
              query: safeQuery,
              explanation: queryObj.explanation,
              data: data || [],
              rowCount: data?.length || 0,
            }
          } catch (err) {
            return {
              query: '',
              data: [],
              rowCount: 0,
              error: err instanceof Error ? err.message : 'Error generando query',
            }
          }
        },
      },

      // ========================================================================
      // TOOL: ordenar_materias_pendientes (Khan's Algorithm)
      // ========================================================================
      ordenar_materias_pendientes: {
        description: `Ordena TODAS las materias pendientes usando ordenamiento topologico (Khan).
          Agrupa materias por niveles respetando correlativas.
          Desempata materias del mismo nivel por score (impacto + proximidad).
          USAR para: "en que orden cursar", "plan de cursada", "roadmap", "mejores materias".

          IMPORTANTE: Esta tool NO inventa datos, solo ordena lo que existe en la DB.`,
        inputSchema: z.object({
          incluir_optativas: z.boolean().optional()
            .describe('Incluir materias optativas (default: true)'),
        }),
        execute: async ({ incluir_optativas = true }: { incluir_optativas?: boolean }) => {
          if (!careerId) {
            return { error: 'No se especifico una carrera' }
          }

          const approvedCodes = new Set(approvedSubjects.map(m => m.code))

          // 1. Get all subjects with correlativas
          const { data: allSubjects, error } = await supabase
            .from('materias')
            .select(`
              id, codigo, nombre, anio, cuatrimestre, horas,
              correlativas!correlativas_materia_id_fkey(correlativa_codigo)
            `)
            .eq('carrera_id', careerId)

          if (error) return { error: error.message }
          if (!allSubjects?.length) return { error: 'No se encontraron materias' }

          // 2. Filter pending subjects
          type SubjectWithCorrelativas = {
            id: string
            codigo: string
            nombre: string
            anio: string
            cuatrimestre: string
            horas: number
            correlativas: Array<{ correlativa_codigo: string }> | null
          }

          let pendingSubjects = (allSubjects as SubjectWithCorrelativas[])
            .filter(m => !approvedCodes.has(m.codigo))

          if (!incluir_optativas) {
            pendingSubjects = pendingSubjects.filter(m =>
              !m.nombre.toLowerCase().includes('optativa')
            )
          }

          if (!pendingSubjects.length) {
            return { niveles: [], total_pendientes: 0, mensaje: 'No hay materias pendientes' }
          }

          const pendingCodes = new Set(pendingSubjects.map(m => m.codigo))

          // 3. Calculate dependents count for scoring
          const dependentsCount = new Map<string, number>()
          for (const s of pendingSubjects) {
            const count = pendingSubjects.filter(d =>
              d.correlativas?.some(c => c.correlativa_codigo === s.codigo)
            ).length
            dependentsCount.set(s.codigo, count)
          }

          // 4. Calculate in-degree (pending correlativas)
          const inDegree = new Map<string, number>()
          for (const s of pendingSubjects) {
            const pending = (s.correlativas || [])
              .filter(c => pendingCodes.has(c.correlativa_codigo)).length
            inDegree.set(s.codigo, pending)
          }

          // 5. Calculate score_final
          const maxDeps = Math.max(...Array.from(dependentsCount.values()), 1)
          const scored = pendingSubjects.map(m => {
            const deps = dependentsCount.get(m.codigo) || 0
            const anio = parseInt(m.anio || '1')
            const cuatri = parseInt(m.cuatrimestre || '1')
            const impacto = deps / maxDeps
            const proximidad = ((1 - (anio - 1) / maxYear) * 0.8) + (cuatri === 1 ? 0.2 : 0.14)
            const score = Math.round((impacto * 0.3 + proximidad * 0.7) * 100) / 100
            return { ...m, dependientes: deps, score_final: score }
          })

          // 6. Khan's Algorithm
          type NivelMateria = {
            codigo: string
            nombre: string
            anio: string
            cuatrimestre: string
            horas: number
            dependientes: number
            score_final: number
          }
          type NivelMaterias = { nivel: number; materias: NivelMateria[] }

          const result: NivelMaterias[] = []
          const processed = new Set<string>()
          let nivel = 0

          while (processed.size < scored.length) {
            const ready = scored
              .filter(m => !processed.has(m.codigo) && inDegree.get(m.codigo) === 0)
              .sort((a, b) => b.score_final - a.score_final)

            if (!ready.length) {
              // Cycle detected - add remaining as level -1
              const remaining = scored.filter(m => !processed.has(m.codigo))
              result.push({
                nivel: -1,
                materias: remaining.map(m => ({
                  codigo: m.codigo,
                  nombre: m.nombre,
                  anio: m.anio,
                  cuatrimestre: m.cuatrimestre,
                  horas: m.horas,
                  dependientes: m.dependientes,
                  score_final: m.score_final,
                }))
              })
              break
            }

            result.push({
              nivel,
              materias: ready.map(m => ({
                codigo: m.codigo,
                nombre: m.nombre,
                anio: m.anio,
                cuatrimestre: m.cuatrimestre,
                horas: m.horas,
                dependientes: m.dependientes,
                score_final: m.score_final,
              }))
            })

            // Update in-degrees
            for (const s of ready) {
              processed.add(s.codigo)
              for (const dep of scored) {
                if (dep.correlativas?.some(c => c.correlativa_codigo === s.codigo)) {
                  inDegree.set(dep.codigo, Math.max(0, (inDegree.get(dep.codigo) || 0) - 1))
                }
              }
            }
            nivel++
          }

          return {
            niveles: result,
            total_pendientes: pendingSubjects.length,
            total_niveles: result.length,
            criterio: 'Khan + Score (30% impacto + 70% proximidad)',
            nota: 'Nivel 0 = disponibles ahora. Nivel N = requiere completar niveles anteriores.',
          }
        },
      },
    },

    // ==========================================================================
    // EXECUTION CONTROL
    // ==========================================================================

    // Allow more steps: get materias -> validate -> respond
    stopWhen: stepCountIs(7),

    // Track tool calls for logging
    onStepFinish: ({ toolCalls, text }) => {
      if (toolCalls && toolCalls.length > 0) {
        console.log('[Step]', {
          toolCalls: toolCalls.map(tc => tc.toolName),
          hasText: !!text,
        })
      }
    },
  })

  return result.toUIMessageStreamResponse({ sendReasoning: true })
}
