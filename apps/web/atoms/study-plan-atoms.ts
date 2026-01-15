import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { Subject, ProcessedCurriculum } from '@/lib/subjects'

// =============================================================================
// PERSISTENT ATOMS (localStorage)
// =============================================================================

/**
 * Materias completadas por carrera - persistido en localStorage
 * Key: careerId, Value: array de subject IDs completados
 */
export const completedSubjectsByCareerAtom = atomWithStorage<Record<string, string[]>>(
  'study-plan:completed',
  {}
)


// =============================================================================
// SESSION ATOMS (no persistence)
// =============================================================================

/**
 * ID de la carrera actualmente seleccionada
 */
export const currentCareerIdAtom = atom<string>('')

/**
 * Curriculum procesado de la carrera actual
 */
export const curriculumAtom = atom<ProcessedCurriculum | null>(null)

/**
 * Materias que están "temblando" (animación de error/éxito)
 */
export const shakingSubjectsAtom = atom<Map<string, 'red' | 'green'>>(new Map())

/**
 * Materia seleccionada para mostrar en el dialog
 */
export const selectedSubjectAtom = atom<Subject | null>(null)

/**
 * Estado del dialog de información de materia
 */
export const isDialogOpenAtom = atom<boolean>(false)

/**
 * Posiciones originales de los nodos (desde la DB)
 * Se inicializa al cargar el curriculum y no cambia durante la sesión
 */
export const originalPositionsAtom = atom<Record<string, { x: number; y: number }>>({})

// =============================================================================
// DERIVED ATOMS (computed)
// =============================================================================

/**
 * Atom derivado para materias completadas de la carrera actual
 * Getter: devuelve Set<string> de IDs completados
 * Setter: actualiza el array en completedSubjectsByCareerAtom
 */
export const completedSubjectsAtom = atom(
  (get) => {
    const careerId = get(currentCareerIdAtom)
    const allCompleted = get(completedSubjectsByCareerAtom)
    return new Set<string>(allCompleted[careerId] || [])
  },
  (get, set, update: Set<string> | ((prev: Set<string>) => Set<string>)) => {
    const careerId = get(currentCareerIdAtom)
    if (!careerId) return

    const allCompleted = get(completedSubjectsByCareerAtom)
    const currentCompleted = new Set<string>(allCompleted[careerId] || [])

    const newCompleted = typeof update === 'function'
      ? update(currentCompleted)
      : update

    set(completedSubjectsByCareerAtom, {
      ...allCompleted,
      [careerId]: Array.from(newCompleted)
    })
  }
)

/**
 * Materias disponibles para cursar (todas las correlativas aprobadas)
 */
export const availableSubjectsAtom = atom((get) => {
  const curriculum = get(curriculumAtom)
  const completedSubjects = get(completedSubjectsAtom)

  if (!curriculum) return new Set<string>()

  const available = new Set<string>()

  curriculum.subjects.forEach(subject => {
    const allCorrelativesMet = subject.correlativas?.every(correlative => {
      const corrId = correlative.correlativa_materia_id || correlative.correlativa_codigo
      return completedSubjects.has(corrId)
    }) ?? true

    if (allCorrelativesMet) {
      available.add(subject.id)
    }
  })

  return available
})

// =============================================================================
// ACTION ATOMS (write-only atoms for complex operations)
// =============================================================================

/**
 * Atom para resetear todo el estado de la carrera actual
 */
export const resetStudyPlanStateAtom = atom(
  null,
  (get, set) => {
    const careerId = get(currentCareerIdAtom)
    if (!careerId) return

    // Limpiar completadas
    const allCompleted = get(completedSubjectsByCareerAtom)
    set(completedSubjectsByCareerAtom, {
      ...allCompleted,
      [careerId]: []
    })


    // Limpiar estado de UI
    set(selectedSubjectAtom, null)
    set(isDialogOpenAtom, false)
    set(shakingSubjectsAtom, new Map())
  }
)
