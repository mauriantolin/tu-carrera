'use client'

import { useCallback, useLayoutEffect, useRef } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  currentCareerIdAtom,
  curriculumAtom,
  completedSubjectsAtom,
  availableSubjectsAtom,
  shakingSubjectsAtom,
  selectedSubjectAtom,
  isDialogOpenAtom,
  resetStudyPlanStateAtom,
  originalPositionsAtom,
} from '@/atoms/study-plan-atoms'
import { getAllCorrelatives, getAllDependentSubjects, type ProcessedCurriculum } from '@/lib/subjects'
import { useMounted } from '@/hooks/use-mounted'

/**
 * Hook para inicializar el plan de estudios cuando cambia la carrera
 * Debe llamarse una vez en el componente raíz del plan
 */
export function useStudyPlanInit(careerId: string, curriculum: ProcessedCurriculum) {
  const setCurrentCareerId = useSetAtom(currentCareerIdAtom)
  const setCurriculum = useSetAtom(curriculumAtom)
  const setOriginalPositions = useSetAtom(originalPositionsAtom)
  const prevCareerIdRef = useRef<string>('')

  // useLayoutEffect corre síncronamente antes del paint, evitando flash de contenido
  useLayoutEffect(() => {
    if (careerId !== prevCareerIdRef.current) {
      setCurrentCareerId(careerId)
      setCurriculum(curriculum)

      // Guardar posiciones originales del curriculum
      const positions: Record<string, { x: number; y: number }> = {}
      curriculum.subjects.forEach(subject => {
        positions[subject.id] = { x: subject.position.x, y: subject.position.y }
      })
      setOriginalPositions(positions)

      prevCareerIdRef.current = careerId
    }
  }, [careerId, curriculum, setCurrentCareerId, setCurriculum, setOriginalPositions])
}

/**
 * Hook principal para gestionar el plan de estudios
 * Provee estado y acciones para interactuar con las materias
 */
export function useStudyPlan() {
  const mounted = useMounted()
  const curriculum = useAtomValue(curriculumAtom)
  const [completedSubjects, setCompletedSubjects] = useAtom(completedSubjectsAtom)
  const availableSubjects = useAtomValue(availableSubjectsAtom)
  const [shakingSubjects, setShakingSubjects] = useAtom(shakingSubjectsAtom)
  const [selectedSubject, setSelectedSubject] = useAtom(selectedSubjectAtom)
  const [isDialogOpen, setIsDialogOpen] = useAtom(isDialogOpenAtom)
  const resetState = useSetAtom(resetStudyPlanStateAtom)
  const originalPositions = useAtomValue(originalPositionsAtom)

  // Toggle de materia completada con validación de correlativas
  const toggleSubject = useCallback((subjectId: string) => {
    if (!curriculum) return

    setCompletedSubjects(prev => {
      const newSet = new Set(prev)

      if (!newSet.has(subjectId)) {
        // Intentando agregar: verificar correlativas
        const subject = curriculum.subjects.find(s => s.id === subjectId)

        const allCorrelativesMet = subject?.correlativas?.every(correlative => {
          const corrId = correlative.correlativa_materia_id || correlative.correlativa_codigo
          return prev.has(corrId)
        }) ?? true

        if (!allCorrelativesMet) {
          // Animar materias correlativas faltantes
          const unapprovedCorrelatives = getAllCorrelatives(subjectId, curriculum.subjects, prev)
          const subjectsToShake = new Map<string, 'red' | 'green'>()
          ;[subjectId, ...unapprovedCorrelatives].forEach(id => subjectsToShake.set(id, 'red'))

          setShakingSubjects(subjectsToShake)
          setTimeout(() => setShakingSubjects(new Map()), 1400)

          return prev // No modificar
        }

        newSet.add(subjectId)
      } else {
        // Quitando: también quitar dependientes
        newSet.delete(subjectId)
        const dependents = getAllDependentSubjects(subjectId, curriculum.dependentsMap)
        dependents.forEach(depId => newSet.delete(depId))
      }

      return newSet
    })
  }, [curriculum, setCompletedSubjects, setShakingSubjects])

  // Mostrar información de materia en dialog
  const showInfo = useCallback((subjectId: string) => {
    if (!curriculum) return

    const subject = curriculum.subjects.find(s => s.id === subjectId)
    if (subject) {
      setSelectedSubject(subject)
      setIsDialogOpen(true)
    }
  }, [curriculum, setSelectedSubject, setIsDialogOpen])


  // Cerrar dialog
  const closeDialog = useCallback(() => {
    setIsDialogOpen(false)
    setSelectedSubject(null)
  }, [setIsDialogOpen, setSelectedSubject])

  return {
    // Estado
    isLoading: !mounted,
    curriculum,
    completedSubjects,
    availableSubjects,
    shakingSubjects,
    selectedSubject,
    isDialogOpen,
    originalPositions,

    // Acciones
    toggleSubject,
    showInfo,
    closeDialog,
    resetState,
    setIsDialogOpen,
  }
}

/**
 * Hook para obtener el estado de una materia específica
 * Útil para componentes individuales de nodos
 */
export function useSubjectState(subjectId: string) {
  const completedSubjects = useAtomValue(completedSubjectsAtom)
  const availableSubjects = useAtomValue(availableSubjectsAtom)
  const shakingSubjects = useAtomValue(shakingSubjectsAtom)

  const isCompleted = completedSubjects.has(subjectId)
  const isAvailable = availableSubjects.has(subjectId)
  const isBlocked = !isCompleted && !isAvailable
  const isShaking = shakingSubjects.has(subjectId)
  const shakingColor = shakingSubjects.get(subjectId) || 'red'

  return {
    isCompleted,
    isAvailable,
    isBlocked,
    isShaking,
    shakingColor,
  }
}
