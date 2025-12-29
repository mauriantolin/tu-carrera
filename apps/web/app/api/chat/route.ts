import { openai } from '@ai-sdk/openai'
import { streamText, embed, convertToModelMessages, type UIMessage, stepCountIs } from 'ai'
import { createClientDb } from '@/utils/db/server'
import { z } from 'zod'

interface ApprovedSubject {
  code: string
  name: string
  year: string
}

export async function POST(req: Request) {
  const {
    messages,
    careerId: rawCareerId,
    approvedSubjects = [],
    maxYear = 5
  }: {
    messages: UIMessage[]
    careerId?: string
    approvedSubjects?: ApprovedSubject[]
    maxYear?: number
  } = await req.json()

  const careerId = rawCareerId && rawCareerId.length > 0 ? rawCareerId : null
  const supabase = await createClientDb()

  const studentProgress = approvedSubjects.length > 0
    ? `\n\nESTADO ACTUAL DEL ESTUDIANTE:
- Materias aprobadas (${approvedSubjects.length}): ${approvedSubjects.map(m => m.name).join(', ')}
- Códigos aprobados: ${approvedSubjects.map(m => m.code).join(', ')}

IMPORTANTE: Usa esta información para dar consejos personalizados. Si el estudiante pregunta qué cursar, considera qué materias ya aprobó y cuáles puede desbloquear ahora.`
    : '\n\nESTADO ACTUAL: El estudiante no tiene materias marcadas como aprobadas aún.'

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: `Eres un asistente académico experto de la universidad UADE llamado Titulín.
Ayudas a estudiantes con información estratégica sobre materias, contenidos, correlativas y planificación académica.
Responde en español, de forma clara y con contexto útil.

DATOS DE LA CARRERA:
- Duración: ${maxYear} años
${studentProgress}

REGLA OBLIGATORIA - RECOMENDACIONES DE MATERIAS:
Cuando el usuario pregunte qué materias cursar, cuáles le convienen, o pida recomendaciones:
1. USA obtener_mejores_materias_para_cursar - Esta herramienta combina disponibilidad + impacto + proximidad temporal
2. Las materias que retorna YA están filtradas (no incluye aprobadas) y ordenadas por score óptimo
3. Explica POR QUÉ cada materia es buena opción usando el campo "razon" y los scores

HERRAMIENTAS DISPONIBLES:
- obtener_mejores_materias_para_cursar: USAR para "qué me conviene", "mejores materias", "qué cursar", "materias críticas". Combina disponibilidad + impacto + proximidad.
- obtener_materias_disponibles: Lista TODAS las materias que puede cursar ahora (con scores).
- analizar_materia: Info completa de una materia específica.
- buscar_materias_por_anio: Materias de un año específico.
- buscar_contenidos: Buscar temas o conceptos específicos.
- obtener_estructura_carrera: Estructura completa del plan.

REGLAS CRÍTICAS:
1. NUNCA recomiendes materias que el estudiante ya aprobó - están listadas arriba en "Materias aprobadas"
2. Prioriza materias de años cercanos al progreso actual, no saltes varios años
3. Siempre menciona qué materias desbloquea cada recomendación
4. Usa el score_final para justificar tus recomendaciones (combina impacto y proximidad)
5. Si el usuario pregunta por "las mejores" o "qué le conviene", usa obtener_mejores_materias_para_cursar`,
    messages: convertToModelMessages(messages),
    tools: {
      buscar_materias_por_anio: {
        description: 'Busca todas las materias de un año específico de la carrera. Útil para preguntas como "materias de 4to año" o "qué materias hay en primer año"',
        inputSchema: z.object({
          anio: z.string().describe('Año de la carrera (1, 2, 3, 4, 5, 6, 7, 8)'),
        }),
        execute: async ({ anio }: { anio: string }) => {
          if (!careerId) {
            return { error: 'No se especificó una carrera' }
          }
          const { data, error } = await supabase
            .from('materias')
            .select('codigo, nombre, horas, cuatrimestre')
            .eq('carrera_id', careerId)
            .eq('anio', anio)
            .order('cuatrimestre')
          if (error) return { error: error.message }
          return data || []
        },
      },

      buscar_contenidos: {
        description: 'Búsqueda semántica en los contenidos de las materias. Útil para preguntas sobre temas específicos como "materias que enseñan programación" o "dónde aprendo sobre bases de datos"',
        inputSchema: z.object({
          query: z.string().describe('Tema o concepto a buscar'),
        }),
        execute: async ({ query }: { query: string }) => {
          try {
            const { embedding } = await embed({
              model: openai.embedding('text-embedding-3-small'),
              value: query,
            })
            const { data, error } = await supabase.rpc('search_contenidos', {
              query_embedding: embedding,
              carrera_id_filter: careerId,
              match_threshold: 0.4,
              match_count: 5,
            })
            if (error) return { error: error.message }
            return data || []
          } catch {
            return { error: 'Error en búsqueda semántica' }
          }
        },
      },

      analizar_materia: {
        description: 'Análisis completo de una materia: prerrequisitos, materias que desbloquea, y score de importancia. Usar SIEMPRE para preguntas sobre materias específicas.',
        inputSchema: z.object({
          materia_nombre: z.string().describe('Nombre o parte del nombre de la materia a analizar'),
        }),
        execute: async ({ materia_nombre }: { materia_nombre: string }) => {
          if (!careerId) {
            return { error: 'No se especificó una carrera' }
          }

          const { data: rpcData, error: rpcError } = await supabase.rpc('analizar_materia', {
            materia_nombre_param: materia_nombre,
            carrera_id_param: careerId,
          })

          if (!rpcError && rpcData && rpcData.length > 0) {
            return rpcData
          }

          const { data: subjects, error } = await supabase
            .from('materias')
            .select(`
              id,
              codigo,
              nombre,
              anio,
              cuatrimestre,
              horas,
              correlativas!correlativas_materia_id_fkey(
                correlativa_codigo,
                correlativa:materias!correlativas_correlativa_materia_id_fkey(nombre, codigo)
              )
            `)
            .eq('carrera_id', careerId)
            .ilike('nombre', `%${materia_nombre}%`)

          if (error) {
            return { error: error.message }
          }

          const results = await Promise.all((subjects || []).map(async (m: any) => {
            const { data: dependents } = await supabase
              .from('correlativas')
              .select(`
                materia:materias!correlativas_materia_id_fkey(codigo, nombre, anio)
              `)
              .eq('correlativa_codigo', m.codigo)

            const unlocks = (dependents || [])
              .map((d: any) => d.materia)
              .filter((d: any) => d !== null)

            return {
              codigo: m.codigo,
              nombre: m.nombre,
              anio: m.anio,
              cuatrimestre: m.cuatrimestre,
              horas: m.horas,
              prerrequisitos: (m.correlativas || [])
                .map((c: any) => c.correlativa)
                .filter((c: any) => c !== null),
              desbloquea: unlocks,
              dependientes_directos: unlocks.length,
              score_importancia: unlocks.length * 2 + (maxYear - parseInt(m.anio || '1')) * 0.3,
            }
          }))

          return results
        },
      },

      obtener_materias_disponibles: {
        description: 'Obtiene las materias que el estudiante puede cursar AHORA (tiene las correlativas aprobadas pero NO aprobó la materia). USAR SIEMPRE cuando pregunten "qué puedo cursar" o "qué materias me faltan".',
        inputSchema: z.object({}),
        execute: async () => {
          if (!careerId) {
            return { error: 'No se especificó una carrera' }
          }

          const approvedCodes = new Set(approvedSubjects.map(m => m.code))

          const { data: subjects, error } = await supabase
            .from('materias')
            .select(`
              id,
              codigo,
              nombre,
              anio,
              cuatrimestre,
              horas,
              correlativas!correlativas_materia_id_fkey(
                correlativa_codigo
              )
            `)
            .eq('carrera_id', careerId)
            .order('anio')
            .order('cuatrimestre')

          if (error) return { error: error.message }

          const available = (subjects || []).filter((m: any) => {
            if (approvedCodes.has(m.codigo)) return false
            if (!m.correlativas || m.correlativas.length === 0) return true
            return m.correlativas.every((c: any) => approvedCodes.has(c.correlativa_codigo))
          })

          // Calcular dependientes y score para cada materia disponible
          const availableWithScore = available.map((m: any) => {
            const dependientes = (subjects || []).filter((s: any) =>
              s.correlativas?.some((c: any) => c.correlativa_codigo === m.codigo)
            ).length

            return {
              codigo: m.codigo,
              nombre: m.nombre,
              anio: m.anio,
              cuatrimestre: m.cuatrimestre,
              horas: m.horas,
              correlativas_requeridas: m.correlativas?.length || 0,
              dependientes_directos: dependientes,
              score_importancia: dependientes * 2 + (maxYear - parseInt(m.anio || '1')) * 0.3,
            }
          }).sort((a, b) => b.score_importancia - a.score_importancia)

          return {
            materias_disponibles: availableWithScore,
            total_disponibles: availableWithScore.length,
            total_aprobadas: approvedCodes.size,
          }
        },
      },

      obtener_mejores_materias_para_cursar: {
        description: 'Obtiene las MEJORES materias para cursar AHORA, combinando: disponibilidad (correlativas OK), impacto (scoring) y proximidad temporal. USAR SIEMPRE para "qué me conviene", "mejores materias", "qué debería cursar".',
        inputSchema: z.object({
          limite: z.number().optional().describe('Cantidad de materias a devolver (default: 5)'),
        }),
        execute: async ({ limite = 5 }: { limite?: number }) => {
          if (!careerId) {
            return { error: 'No se especificó una carrera' }
          }

          const approvedCodes = new Set(approvedSubjects.map(m => m.code))

          const { data: subjects, error } = await supabase
            .from('materias')
            .select(`
              id,
              codigo,
              nombre,
              anio,
              cuatrimestre,
              horas,
              correlativas!correlativas_materia_id_fkey(
                correlativa_codigo
              )
            `)
            .eq('carrera_id', careerId)

          if (error) return { error: error.message }

          // Filtrar solo materias disponibles (no aprobadas + correlativas OK)
          const available = (subjects || []).filter((m: any) => {
            if (approvedCodes.has(m.codigo)) return false
            if (!m.correlativas || m.correlativas.length === 0) return true
            return m.correlativas.every((c: any) => approvedCodes.has(c.correlativa_codigo))
          })

          if (available.length === 0) {
            return {
              mejores_materias: [],
              mensaje: 'No hay materias disponibles para cursar. Verifica tus correlativas.',
            }
          }

          // Calcular dependientes para cada materia
          const materiasConDependientes = available.map((m: any) => {
            const dependientes = (subjects || []).filter((s: any) =>
              s.correlativas?.some((c: any) => c.correlativa_codigo === m.codigo)
            ).length
            return { ...m, dependientes }
          })

          // Encontrar máximo de dependientes para normalizar
          const maxDependientes = Math.max(...materiasConDependientes.map((m: any) => m.dependientes), 1)

          // Calcular score final: 50% impacto + 50% proximidad
          const materiasConScore = materiasConDependientes.map((m: any) => {
            const impactoNorm = m.dependientes / maxDependientes
            const anio = parseInt(m.anio || '1')
            const proximidad = 1 - (anio - 1) / maxYear

            const scoreFinal = (impactoNorm * 0.5) + (proximidad * 0.5)

            return {
              codigo: m.codigo,
              nombre: m.nombre,
              anio: m.anio,
              cuatrimestre: m.cuatrimestre,
              horas: m.horas,
              dependientes_directos: m.dependientes,
              score_impacto: Math.round(impactoNorm * 100) / 100,
              score_proximidad: Math.round(proximidad * 100) / 100,
              score_final: Math.round(scoreFinal * 100) / 100,
              razon: m.dependientes > 0
                ? `Desbloquea ${m.dependientes} materia${m.dependientes > 1 ? 's' : ''}`
                : 'Sin materias dependientes (pero disponible para cursar)',
            }
          }).sort((a, b) => b.score_final - a.score_final)

          return {
            mejores_materias: materiasConScore.slice(0, limite),
            total_disponibles: materiasConScore.length,
            criterio: 'Score final = 50% impacto (materias que desbloquea) + 50% proximidad (años tempranos primero)',
          }
        },
      },

      obtener_estructura_carrera: {
        description: 'Obtiene la estructura completa de la carrera con todas las materias organizadas por año y cuatrimestre',
        inputSchema: z.object({}),
        execute: async () => {
          if (!careerId) {
            return { error: 'No se especificó una carrera' }
          }
          const { data, error } = await supabase
            .from('materias')
            .select('anio, cuatrimestre, codigo, nombre, horas')
            .eq('carrera_id', careerId)
            .order('anio')
            .order('cuatrimestre')
            .order('codigo')

          if (error) return { error: error.message }

          type SubjectRow = { anio: string; cuatrimestre: string; codigo: string; nombre: string; horas: number }
          const grouped: Record<string, Record<string, Array<{ codigo: string; nombre: string; horas: number }>>> = {}
          for (const m of (data || []) as SubjectRow[]) {
            const yearKey = m.anio
            const semesterKey = m.cuatrimestre
            if (!grouped[yearKey]) grouped[yearKey] = {}
            const yearGroup = grouped[yearKey]!
            if (!yearGroup[semesterKey]) yearGroup[semesterKey] = []
            yearGroup[semesterKey]!.push({ codigo: m.codigo, nombre: m.nombre, horas: m.horas })
          }
          return grouped
        },
      },
    },
    stopWhen: stepCountIs(5),
  })

  return result.toUIMessageStreamResponse()
}
