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

REGLA OBLIGATORIA - HERRAMIENTA obtener_materias_disponibles:
DEBES llamar a obtener_materias_disponibles SIEMPRE que:
- El usuario pregunte qué puede cursar, qué materias hacer, qué le conviene
- Hables de recomendaciones de materias
- Menciones el plan de estudios del usuario
- Sugieras próximos pasos académicos
- El usuario pregunte "qué me falta" o "qué sigue"
NO respondas sobre recomendaciones sin antes consultar esta herramienta.

OTRAS HERRAMIENTAS:
- analizar_materia: Info completa de una materia específica (prerrequisitos, qué desbloquea, score).
- obtener_materias_criticas: Materias más importantes ordenadas por impacto.
- buscar_materias_por_anio: Materias de un año específico.
- buscar_contenidos: Buscar temas o conceptos específicos.
- obtener_estructura_carrera: Estructura completa del plan.

INSTRUCCIONES:
1. NUNCA recomiendes materias que el estudiante ya aprobó.
2. Siempre menciona qué materias desbloquea cada recomendación.
3. Destaca materias con alto impacto (desbloquean muchas otras).
4. Personaliza según el progreso del estudiante.`,
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

      obtener_materias_criticas: {
        description: 'Obtiene las materias más importantes de la carrera ordenadas por impacto (cuántas materias desbloquean). Usar para planificación y prioridades.',
        inputSchema: z.object({
          limite: z.number().optional().describe('Cantidad de materias a devolver (default: 10)'),
        }),
        execute: async ({ limite = 10 }: { limite?: number }) => {
          if (!careerId) {
            return { error: 'No se especificó una carrera' }
          }

          const { data: rpcData, error: rpcError } = await supabase.rpc('obtener_materias_criticas', {
            carrera_id_param: careerId,
            limite,
          })

          if (!rpcError && rpcData) {
            return rpcData
          }

          const { data: subjects } = await supabase
            .from('materias')
            .select('id, codigo, nombre, anio, cuatrimestre, horas')
            .eq('carrera_id', careerId)

          const { data: prerequisites } = await supabase
            .from('correlativas')
            .select('correlativa_codigo, materia_id')

          const dependentsCount: Record<string, number> = {}
          for (const c of prerequisites || []) {
            dependentsCount[c.correlativa_codigo] = (dependentsCount[c.correlativa_codigo] || 0) + 1
          }

          const subjectsWithScore = (subjects || [])
            .map((m: any) => ({
              ...m,
              dependientes_directos: dependentsCount[m.codigo] || 0,
              score_importancia: (dependentsCount[m.codigo] || 0) * 2 + (maxYear - parseInt(m.anio || '1')) * 0.3,
            }))
            .filter((m: any) => m.dependientes_directos > 0)
            .sort((a: any, b: any) => b.score_importancia - a.score_importancia)
            .slice(0, limite)

          return subjectsWithScore
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
          }).map((m: any) => ({
            codigo: m.codigo,
            nombre: m.nombre,
            anio: m.anio,
            cuatrimestre: m.cuatrimestre,
            horas: m.horas,
            correlativas_requeridas: m.correlativas?.length || 0,
          }))

          return {
            materias_disponibles: available,
            total_disponibles: available.length,
            total_aprobadas: approvedCodes.size,
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
