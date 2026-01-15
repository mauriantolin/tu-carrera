import { Button } from "@workspace/ui/components/button"
import Link from "next/link"

const steps = [
  {
    number: "1",
    title: "Elegí tu facultad y carrera",
    description: "Seleccioná tu facultad y la carrera que estás cursando de nuestra lista de opciones disponibles.",
  },
  {
    number: "2",
    title: "Marcá tu progreso",
    description: "Hacé click en las materias que ya cursaste para ver automáticamente cuáles podés cursar ahora.",
  },
  {
    number: "3",
    title: "Planificá tu cuatrimestre",
    description: "Visualizá qué materias están disponibles y planificá tu próximo cuatrimestre de forma inteligente.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 md:py-32">
      <div className="container max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center space-y-4 mb-20">
          <h2 className="text-4xl md:text-6xl font-medium tracking-tight">Cómo funciona</h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Tres simples pasos para empezar a organizar tu carrera universitaria
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-border mb-16">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-background p-8 md:p-12 group hover:bg-muted/30 transition-all duration-300"
            >
              <div className="space-y-6">
                <div className="inline-flex h-12 w-12 items-center justify-center bg-foreground text-background text-xl font-medium">
                  {step.number}
                </div>
                <h3 className="text-xl font-medium">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Button asChild size="lg" className="text-sm h-11 px-6 text-background rounded-none">
            <Link href="/carreras">Probar ahora</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
