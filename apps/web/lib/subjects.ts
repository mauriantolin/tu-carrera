import type { MateriaWithRelations, Correlativa } from './types'

// =============================================================================
// TYPES FOR CLIENT
// =============================================================================

export type Subject = Omit<MateriaWithRelations, 'carrera'> & {position: { x: number, y: number }}

export interface ProcessedCurriculum {
  subjects: Subject[]
  dependentsMap: Record<string, string[]>
  maxYear: number
  maxCuatrimestre: number
}

export interface SubjectPriority {
  subjectId: string
  priority: number
  dependentsCount: number
}

// =============================================================================
// HELPER FUNCTIONS - Can run on server
// =============================================================================

export function extractYearNumber(año: string | null | undefined): number {
  if (!año) return 99
  const match = año.match(/(\d+)/)
  return match ? parseInt(match[1] as string) : 99
}

export function extractCuatrimestreNumber(cuatrimestre: string | null | undefined): number {
  if (!cuatrimestre) return 1
  const match = cuatrimestre.match(/(\d+)/)
  return match ? parseInt(match[1] as string) : 1
}

export function calculatePriority(subject: Subject, numDependents: number): number {
  const WEIGHTS = {
    dependents: 1.0,
    year: 5.0,
  }

  const yearNum = extractYearNumber(subject.anio)
  const cuatrimestreNum = extractCuatrimestreNumber(subject.cuatrimestre)

  const temporalDivisor = yearNum + (0.5 * cuatrimestreNum)
  const yearScore = WEIGHTS.year / temporalDivisor
  const dependentsScore = WEIGHTS.dependents * numDependents

  return Math.round(dependentsScore + yearScore) / 100
}

// =============================================================================
// GRAPH LAYOUT ALGORITHM
// =============================================================================

/**
 * Generates automatic positions for subjects based on year and semester
 * using a hierarchical layout
 */
export function subjectPositions(subjects: Subject[]): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>()

  const grouped = new Map<string, Subject[]>()

  subjects.forEach(subject => {
    const key = `${subject.anio}-${subject.cuatrimestre}`
    if (!grouped.has(key)) {
      grouped.set(key, [])
    }
    grouped.get(key)!.push(subject)
  })

  console.log('[subjectPositions] Groups created:', Array.from(grouped.keys()))

  // Sort groups by year and cuatrimestre
  const sortedGroups = Array.from(grouped.entries()).sort((a, b) => {
    const [yearA, cuatA] = a[0].split('-')
    const [yearB, cuatB] = b[0].split('-')

    const yearNumA = extractYearNumber(yearA)
    const yearNumB = extractYearNumber(yearB)

    if (yearNumA !== yearNumB) {
      return yearNumA - yearNumB
    }

    return extractCuatrimestreNumber(cuatA) - extractCuatrimestreNumber(cuatB)
  })

  const VERTICAL_SPACING = 550
  const HORIZONTAL_SPACING = 850
  const START_Y = 100
  const START_X = 100

  let currentY = START_Y

  sortedGroups.forEach(([_, groupSubjects]) => {
    const currentX = START_X

    groupSubjects.forEach((subject, index) => {
      positions.set(subject.id, {
        x: currentX + (index * HORIZONTAL_SPACING),
        y: currentY
      })
    })

    currentY += VERTICAL_SPACING
  })

  return positions
}

// =============================================================================
// DEPENDENCIES MAP
// =============================================================================

/**
 * Builds a map of subject -> dependents (subjects that require this one)
 * Uses correlativa_materia_id (UUID) when available, falls back to correlativa_codigo
 */
export function buildDependentsMap(subjects: Subject[]): Map<string, string[]> {
  const map = new Map<string, string[]>()

  subjects.forEach(subject => {
    subject.correlativas?.forEach(correlativa => {
      // Preferir UUID (correlativa_materia_id) sobre código
      const correlativeId = correlativa.correlativa_materia_id || correlativa.correlativa_codigo
      if (correlativeId) {
        if (!map.has(correlativeId)) {
          map.set(correlativeId, [])
        }
        map.get(correlativeId)!.push(subject.id)
      }
    })
  })

  return map
}

/**
 * Gets all dependent subjects recursively
 */
export function getAllDependentSubjects(
  subjectId: string,
  dependentsMap: Record<string, string[]>
): Set<string> {
  const allDependents = new Set<string>()
  const directDependents = dependentsMap[subjectId] || []

  directDependents.forEach(dependentId => {
    allDependents.add(dependentId)
    const nestedDependents = getAllDependentSubjects(dependentId, dependentsMap)
    nestedDependents.forEach(id => allDependents.add(id))
  })

  return allDependents
}

/**
 * Counts all dependents (direct + indirect) for each subject
 */
export function countAllDependents(
  subjectId: string,
  dependentsMap: Map<string, string[]>,
  visited = new Set<string>()
): number {
  if (visited.has(subjectId)) return 0
  visited.add(subjectId)

  const directDependents = dependentsMap.get(subjectId) || []
  let count = 0

  directDependents.forEach(depId => {
    count += 1
    count += countAllDependents(depId, dependentsMap, visited)
  })

  return count
}

/**
 * Counts dependents that are NOT completed (for client-side topological ordering)
 */
export function countDependentsNotCompleted(
  subjectId: string,
  dependentsMap: Record<string, string[]>,
  completedSubjects: Set<string>,
  visited = new Set<string>()
): number {
  if (visited.has(subjectId)) return 0
  visited.add(subjectId)

  const directDependents = dependentsMap[subjectId] || []
  let count = 0

  directDependents.forEach(depId => {
    if (!completedSubjects.has(depId)) {
      count += 1
      count += countDependentsNotCompleted(depId, dependentsMap, completedSubjects, visited)
    }
  })

  return count
}

/**
 * Gets all prerequisite subjects recursively (for client-side validation)
 * Uses correlativa_materia_id (UUID) when available
 */
export function getAllCorrelatives(
  subjectId: string,
  subjects: Subject[],
  completedSubjects: Set<string>
): Set<string> {
  const allCorrelatives = new Set<string>()
  const subject = subjects.find(s => s.id === subjectId)
  if (!subject) return allCorrelatives

  subject.correlativas?.forEach(correlative => {
    const correlativeId = correlative.correlativa_materia_id || correlative.correlativa_codigo
    if (correlativeId && !completedSubjects.has(correlativeId)) {
      allCorrelatives.add(correlativeId)
      const nestedCorrelatives = getAllCorrelatives(correlativeId, subjects, completedSubjects)
      nestedCorrelatives.forEach(id => allCorrelatives.add(id))
    }
  })

  return allCorrelatives
}

// =============================================================================
// TOPOLOGICAL ORDERING
// =============================================================================

/**
 * Calculate initial subject priorities using topological ordering
 */
export function calculateSubjectPriorities(subjects: Subject[]): SubjectPriority[] {
  const dependentsMap = buildDependentsMap(subjects)
  const priorities: SubjectPriority[] = []

  subjects.forEach(subject => {
    const dependentsCount = countAllDependents(subject.id, dependentsMap)
    const priority = calculatePriority(subject, dependentsCount)

    priorities.push({
      subjectId: subject.id,
      priority,
      dependentsCount
    })
  })

  // Sort by priority descending
  return priorities.sort((a, b) => b.priority - a.priority)
}

// =============================================================================
// MAIN PROCESSING FUNCTION
// =============================================================================

/**
 * Processes raw materias from database into a curriculum ready for the client
 * Positions are now pre-calculated in the database during scraping
 */
export function processCurriculum(materias: Omit<MateriaWithRelations, 'carrera'>[]): ProcessedCurriculum {
  // Usar posiciones directamente de la base de datos (pre-calculadas en el scraper)
  const subjects: Subject[] = materias.map(materia => ({
    ...materia,
    position: {
      x: materia.position_x,
      y: materia.position_y
    }
  }))

  // Build dependents map usando correlativa_materia_id (UUID)
  const dependentsMap = buildDependentsMap(subjects)
  const dependentsMapRecord: Record<string, string[]> = {}
  dependentsMap.forEach((value, key) => {
    dependentsMapRecord[key] = value
  })

  // Calculate max year and cuatrimestre
  const maxYear = Math.max(...subjects.map(s => extractYearNumber(s.anio)))
  const maxCuatrimestre = Math.max(...subjects.map(s => extractCuatrimestreNumber(s.cuatrimestre)))

  return {
    subjects,
    dependentsMap: dependentsMapRecord,
    maxYear,
    maxCuatrimestre
  }
}
