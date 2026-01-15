import { BookOpen, MessageSquare, GitBranch, TrendingUp, School, FileText } from "lucide-react"

const features = [
  {
    icon: GitBranch,
    title: "Visualización Clara",
    description:
      "Diagrama interactivo que muestra las correlativas y dependencias entre materias de forma visual e intuitiva.",
  },
  {
    icon: MessageSquare,
    title: "Titulín, tu asistente virtual",
    description: "Un asistente virtual con toda la información de tu carrera.",
  },
  {
    icon: BookOpen,
    title: "Correlativas",
    description: "Charlá con Titulín para ver las materias que podés cursar.",
  },
  {
    icon: TrendingUp,
    title: "Seguimiento de Progreso",
    description: "Marcá las materias cursadas y visualizá automáticamente cuáles están disponibles para cursar.",
  },
  {
    icon: School,
    title: "Múltiples Carreras",
    description: "Planes de estudio de UADE, para todas las facultades y todas las carreras.",
  },
  {
    icon: FileText,
    title: "Información Detallada",
    description: "Accedé a los contenidos y detalles de cada materia con un simple click.",
  },
]

export function Features() {
  return (
    <section className="py-24 md:py-32 dotted-background">
      <div className="container max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center space-y-4 mb-20">
          <h2 className="text-4xl md:text-6xl font-medium tracking-tight text-balance">
            Todo lo que necesitás para planificar tu carrera
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Herramientas diseñadas para estudiantes universitarios que quieren organizarse mejor
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative bg-background p-8 md:p-10 hover:bg-muted/30 transition-all duration-300"
            >
              <div className="flex flex-col space-y-4">
                <div className="h-10 w-10 flex items-center justify-center text-foreground group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-medium">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>

              <div className="absolute bottom-0 left-0 h-px w-0 bg-foreground group-hover:w-full transition-all duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
