"use client"

import '@xyflow/react/dist/style.css'

import {
  ReactFlow,
  Controls,
  type Node,
  type Edge,
  useNodesState,
  useEdgesState,
  type NodeTypes,
  MarkerType,
} from '@xyflow/react'
import { useEffect, useMemo, useCallback } from 'react'
import type { PlanVisualizerProps } from './page-content'
import { SubjectInfoDialog } from './subject-dialog'
import { SubjectNode } from './subject-node'
import { YearGroupNode } from './year-group-node'
import { FloatingToolbarClient } from './floating-toolbar'
import { ProgressPanel } from './progress-panel'
import { useStudyPlanInit, useStudyPlan } from '@/hooks/use-study-plan'

// Constantes de estilo para edges - fuera del componente para evitar recreacion
const EDGE_STYLE_DEFAULT = { stroke: '#94a3b8', strokeWidth: 4 }
const EDGE_STYLE_COMPLETED = { stroke: '#4ade80', strokeWidth: 4 }
const EDGE_STYLE_SHAKING = { stroke: '#ef4444', strokeWidth: 5 }

const MARKER_DEFAULT = {
  type: MarkerType.ArrowClosed,
  width: 20,
  height: 20,
  color: '#94a3b8',
}

const MARKER_COMPLETED = {
  type: MarkerType.ArrowClosed,
  width: 20,
  height: 20,
  color: '#4ade80',
}

const MARKER_SHAKING = {
  type: MarkerType.ArrowClosed,
  width: 20,
  height: 20,
  color: '#ef4444',
}

const nodeTypes: NodeTypes = {
  subject: SubjectNode,
  yearGroup: YearGroupNode,
}

export function ReactFlowPlan({ curriculum, carreraInfo }: PlanVisualizerProps) {
  // Memoizar careerId
  const careerId = useMemo(
    () => curriculum.subjects[0]?.carrera_id || '',
    [curriculum.subjects]
  )

  // Inicializar atoms con datos del curriculum
  useStudyPlanInit(careerId, curriculum)

  // Hook principal para estado y acciones
  const {
    completedSubjects,
    availableSubjects,
    shakingSubjects,
    selectedSubject,
    isDialogOpen,
    originalPositions,
    toggleSubject,
    showInfo,
    resetState,
    setIsDialogOpen,
  } = useStudyPlan()

  // ReactFlow state
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  // Crear handlers memorizados para cada materia
  const getHandlers = useCallback((subjectId: string) => ({
    onToggle: () => toggleSubject(subjectId),
    onShowInfo: () => showInfo(subjectId),
  }), [toggleSubject, showInfo])

  // ÚNICO useEffect: crear nodes/edges SOLO cuando cambia curriculum (mount inicial)
  // El estado visual (isCompleted, isAvailable, etc.) se maneja en nodesWithState
  useEffect(() => {
    // Crear nodos de grupo por año PRIMERO (z-index bajo, detrás de todo)
    const groupNodes: Node[] = curriculum.yearBounds.map(bounds => ({
      id: `year-group-${bounds.year}`,
      type: 'yearGroup',
      position: { x: bounds.minX, y: bounds.minY },
      data: {
        label: bounds.label,
        year: bounds.year,
      },
      style: {
        width: bounds.width,
        height: bounds.height,
        zIndex: -1,
      },
      selectable: false,
      draggable: false,
    }))

    // Crear nodos de materias DESPUÉS (encima de los grupos)
    const subjectNodes: Node[] = curriculum.subjects.map(subject => {
      const handlers = getHandlers(subject.id)
      return {
        id: subject.id,
        type: 'subject',
        position: subject.position,
        data: {
          label: subject.nombre,
          code: subject.codigo,
          hours: subject.horas,
          // Valores temporales - serán sobrescritos por nodesWithState en cada render
          isCompleted: false,
          isAvailable: false,
          isBlocked: false,
          correlatives: subject.correlativas?.map(c => c.correlativa_materia_id || c.correlativa_codigo) || [],
          completedCorrelatives: 0,
          isShaking: false,
          shakingColor: 'red' as const,
          ...handlers,
        },
        draggable: true,
        style: { zIndex: 1 },
      }
    })

    // Combinar: grupos primero, luego subjects
    const initialNodes = [...groupNodes, ...subjectNodes]

    const initialEdges: Edge[] = curriculum.subjects.flatMap(subject =>
      (subject.correlativas || [])
        .filter(correlativa => correlativa.correlativa_materia_id)
        .map(correlativa => ({
          id: `${correlativa.correlativa_materia_id}-${subject.id}`,
          source: correlativa.correlativa_materia_id!,
          target: subject.id,
          type: 'default',
          animated: true,
          style: EDGE_STYLE_DEFAULT,
          markerEnd: MARKER_DEFAULT,
        }))
    )

    setNodes(initialNodes)
    setEdges(initialEdges)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- Solo ejecutar cuando cambia curriculum, NO cuando cambian los atoms
  }, [curriculum, setNodes, setEdges, getHandlers])

  // Estado visual de nodos derivado con useMemo (NO useEffect)
  const nodesWithState = useMemo(() =>
    nodes.map(node => {
      // Skip year group nodes - no tienen estado visual dinámico
      if (node.type === 'yearGroup') return node

      const isCompleted = completedSubjects.has(node.id)
      const isAvailable = availableSubjects.has(node.id)
      const isBlocked = !isCompleted && !isAvailable

      const subject = curriculum.subjects.find(s => s.id === node.id)
      const completedCorrelatives = subject?.correlativas?.filter(c => {
        const corrId = c.correlativa_materia_id || c.correlativa_codigo
        return completedSubjects.has(corrId)
      }).length || 0

      return {
        ...node,
        data: {
          ...node.data,
          isCompleted,
          isAvailable,
          isBlocked,
          correlatives: subject?.correlativas?.map(c => c.correlativa_materia_id || c.correlativa_codigo) || [],
          completedCorrelatives,
          isShaking: shakingSubjects.has(node.id),
          shakingColor: shakingSubjects.get(node.id) || 'red',
        },
      }
    }),
    [nodes, completedSubjects, availableSubjects, shakingSubjects, curriculum.subjects]
  )

  // Estado visual de edges derivado con useMemo
  const edgesWithState = useMemo(() =>
    edges.map(edge => {
      const isPrereqCompleted = completedSubjects.has(edge.source)
      const isSourceShaking = shakingSubjects.has(edge.source)
      const isTargetShaking = shakingSubjects.has(edge.target)
      const isEdgeShaking = isSourceShaking && isTargetShaking

      if (isEdgeShaking) {
        return {
          ...edge,
          animated: true,
          style: EDGE_STYLE_SHAKING,
          markerEnd: MARKER_SHAKING,
        }
      }

      if (isPrereqCompleted) {
        return {
          ...edge,
          animated: false,
          style: EDGE_STYLE_COMPLETED,
          markerEnd: MARKER_COMPLETED,
        }
      }

      return {
        ...edge,
        animated: true,
        style: EDGE_STYLE_DEFAULT,
        markerEnd: MARKER_DEFAULT,
      }
    }),
    [edges, completedSubjects, shakingSubjects]
  )

  // Handler para resetear las posiciones de los nodos (mantiene estado visual)
  const handleResetPositions = useCallback(() => {
    setNodes(currentNodes =>
      currentNodes.map(node => ({
        ...node,
        position: originalPositions[node.id] || node.position,
      }))
    )
    setIsDialogOpen(false)
  }, [originalPositions, setNodes, setIsDialogOpen])

  return (
    <>
      <div className="w-full h-full relative">
        {/*<ProgressPanel />*/}
        <ReactFlow
          nodes={nodesWithState}
          edges={edgesWithState}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.1}
          maxZoom={1.5}
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={true}
          defaultEdgeOptions={{
            type: "smoothstep",
          }}
          snapToGrid={true}
          snapGrid={[20, 20]}
        >
          <Controls />
        </ReactFlow>
      </div>
      <SubjectInfoDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        subject={selectedSubject}
      />
      <FloatingToolbarClient
        onRollbackState={resetState}
        onRollbackPositions={handleResetPositions}
        carreraInfo={carreraInfo}
        curriculum={curriculum}
      />
    </>
  )
}
