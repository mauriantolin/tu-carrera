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
    <PlanVisualizer curriculum={curriculum} carreraInfo={carreraInfo} />
  )
}

export function PlanVisualizer(props: PlanVisualizerProps) {
  return (
    <ReactFlowProvider>
      <div className="fixed inset-0 top-24 w-full">
        <ReactFlowPlan {...props} />
      </div>
    </ReactFlowProvider>
  )
}
