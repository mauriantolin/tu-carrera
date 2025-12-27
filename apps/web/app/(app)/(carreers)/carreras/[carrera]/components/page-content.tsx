import { getMateriasWithRelations, getCarreraWithRelations } from "@/lib/api"
import { processCurriculum, type ProcessedCurriculum } from "@/lib/subjects"
import type { CarreraWithRelations } from "@/lib/types"
import {
  ReactFlowPlan
} from "./plan-visualizer"
import {
  ReactFlowProvider,
} from '@xyflow/react'

export interface PlanVisualizerProps {
  curriculum: ProcessedCurriculum
  carreraInfo: CarreraWithRelations | null
}

export default async function StudyPlanContent({ params }: { params: Promise<{ carrera: string }> }) {
  const { carrera } = await params

  // Fetch en paralelo: materias y datos de carrera
  const [materias, carreraInfo] = await Promise.all([
    getMateriasWithRelations(carrera),
    getCarreraWithRelations(carrera)
  ])

  // Process curriculum on the server
  const curriculum = processCurriculum(materias || [])

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <PlanVisualizer curriculum={curriculum} carreraInfo={carreraInfo} />
    </div>
  )
}

export function PlanVisualizer(props: PlanVisualizerProps) {
  return (
    <ReactFlowProvider>
      <div style={{ width: '100%', height: '100%' }}>
        <ReactFlowPlan {...props} />
      </div>
    </ReactFlowProvider>
  )
}
