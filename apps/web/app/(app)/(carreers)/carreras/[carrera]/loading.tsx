"use client"

import '@xyflow/react/dist/style.css'

import {
  ReactFlow,
  Controls,
  type Node,
  type Edge,
  type NodeTypes,
  ReactFlowProvider,
  MarkerType,
  Handle,
  Position,
} from '@xyflow/react'
import { memo } from 'react'
import { Card } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"

// ============= SKELETON NODE =============

const SkeletonNode = memo(() => {
  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Top}
        className="!outline-none !border-0 !w-3 !h-3 !bg-muted-foreground/30"
      />

      <Card className="min-w-[300px] max-w-[650px] border-2 border-muted bg-muted/10 animate-pulse">
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-8 w-20 bg-muted-foreground/20" />
              </div>
              <Skeleton className="h-12 w-full bg-muted-foreground/20" />
              <Skeleton className="h-12 w-3/4 mt-1 bg-muted-foreground/20" />
            </div>
            <Skeleton className="h-14 w-14 rounded-md bg-muted-foreground/20" />
          </div>

          <div className="flex items-center justify-between mt-4">
            <Skeleton className="h-9 w-16 rounded-full bg-muted-foreground/20" />
            <Skeleton className="h-7 w-28 bg-muted-foreground/20" />
          </div>
        </div>
      </Card>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!outline-none !border-0 !w-3 !h-3 !bg-muted-foreground/30"
      />
    </div>
  )
})

SkeletonNode.displayName = "SkeletonNode"

// ============= ESTILOS =============

const EDGE_STYLE = { stroke: '#94a3b8', strokeWidth: 4, opacity: 0.4 }

const MARKER = {
  type: MarkerType.ArrowClosed,
  width: 20,
  height: 20,
  color: '#94a3b8',
}

const nodeTypes: NodeTypes = {
  skeleton: SkeletonNode,
}

// ============= DATOS MOCK =============

const SKELETON_NODES: Node[] = [
  // Fila 1 (Año 1, Cuatrimestre 1)
  { id: 's1', type: 'skeleton', position: { x: 100, y: 100 }, data: {} },
  { id: 's2', type: 'skeleton', position: { x: 950, y: 100 }, data: {} },
  { id: 's3', type: 'skeleton', position: { x: 1800, y: 100 }, data: {} },
  { id: 's4', type: 'skeleton', position: { x: 2650, y: 100 }, data: {} },

  // Fila 2 (Año 1, Cuatrimestre 2)
  { id: 's5', type: 'skeleton', position: { x: 100, y: 650 }, data: {} },
  { id: 's6', type: 'skeleton', position: { x: 950, y: 650 }, data: {} },
  { id: 's7', type: 'skeleton', position: { x: 1800, y: 650 }, data: {} },
  { id: 's8', type: 'skeleton', position: { x: 2650, y: 650 }, data: {} },

  // Fila 3 (Año 2, Cuatrimestre 1)
  { id: 's9', type: 'skeleton', position: { x: 525, y: 1200 }, data: {} },
  { id: 's10', type: 'skeleton', position: { x: 1375, y: 1200 }, data: {} },
  { id: 's11', type: 'skeleton', position: { x: 2225, y: 1200 }, data: {} },

  // Fila 4 (Año 2, Cuatrimestre 2)
  { id: 's12', type: 'skeleton', position: { x: 950, y: 1750 }, data: {} },
  { id: 's13', type: 'skeleton', position: { x: 1800, y: 1750 }, data: {} },
]

const SKELETON_EDGES: Edge[] = [
  // Conexiones Fila 1 -> Fila 2
  { id: 'e1-5', source: 's1', target: 's5', style: EDGE_STYLE, markerEnd: MARKER, animated: true },
  { id: 'e2-6', source: 's2', target: 's6', style: EDGE_STYLE, markerEnd: MARKER, animated: true },
  { id: 'e2-7', source: 's2', target: 's7', style: EDGE_STYLE, markerEnd: MARKER, animated: true },
  { id: 'e3-7', source: 's3', target: 's7', style: EDGE_STYLE, markerEnd: MARKER, animated: true },
  { id: 'e4-8', source: 's4', target: 's8', style: EDGE_STYLE, markerEnd: MARKER, animated: true },

  // Conexiones Fila 2 -> Fila 3
  { id: 'e5-9', source: 's5', target: 's9', style: EDGE_STYLE, markerEnd: MARKER, animated: true },
  { id: 'e6-9', source: 's6', target: 's9', style: EDGE_STYLE, markerEnd: MARKER, animated: true },
  { id: 'e6-10', source: 's6', target: 's10', style: EDGE_STYLE, markerEnd: MARKER, animated: true },
  { id: 'e7-10', source: 's7', target: 's10', style: EDGE_STYLE, markerEnd: MARKER, animated: true },
  { id: 'e8-11', source: 's8', target: 's11', style: EDGE_STYLE, markerEnd: MARKER, animated: true },

  // Conexiones Fila 3 -> Fila 4
  { id: 'e9-12', source: 's9', target: 's12', style: EDGE_STYLE, markerEnd: MARKER, animated: true },
  { id: 'e10-12', source: 's10', target: 's12', style: EDGE_STYLE, markerEnd: MARKER, animated: true },
  { id: 'e10-13', source: 's10', target: 's13', style: EDGE_STYLE, markerEnd: MARKER, animated: true },
  { id: 'e11-13', source: 's11', target: 's13', style: EDGE_STYLE, markerEnd: MARKER, animated: true },
]

// ============= COMPONENTE =============

function SkeletonFlow() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={SKELETON_NODES}
        edges={SKELETON_EDGES}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={1.5}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        defaultEdgeOptions={{
          type: "smoothstep",
        }}
      >
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  )
}

export default function LoadingSkeleton() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlowProvider>
        <SkeletonFlow />
      </ReactFlowProvider>
    </div>
  )
}
