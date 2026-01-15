import { Button } from "@workspace/ui/components/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function CTA() {
  return (
    <section className="py-24 md:py-32">
      <div className="container max-w-7xl mx-auto px-4 md:px-6">
        <div className="relative border border-border bg-muted/20 p-12 md:p-20 overflow-hidden dotted-background">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background/80" />
          <div className="relative z-10 flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-medium tracking-tight text-balance">
              Planificá sin estrés con Titulito
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
              Visualización de materias, seguimiento de progreso, asistente virtual y exportación de planes de estudio.
            </p>
            <Button asChild size="lg" className="text-sm text-background h-11 px-6 rounded-none">
              <Link href="/carreras">
                Comenzar ahora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
