import StudyPlanContent from "./components/page-content"

export default function StudyPlanPage({ params }: { params: Promise<{ carrera: string }> }) {
  return <StudyPlanContent params={params} />
}
