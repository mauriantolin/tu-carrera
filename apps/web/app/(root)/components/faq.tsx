import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@workspace/ui/components/accordion"

const faqs = [
  {
    question: "¿Es realmente gratis?",
    answer:
      "Sí, Titulito es completamente gratis y no requiere registro. Podés usar las mejores funcionalidades con AI sin costo alguno.",
  },
  {
    question: "¿Qué universidades están disponibles?",
    answer:
      "Actualmente tenemos planes de estudio de UADE, para todas las carreras y estamos agregando más universidades.",
  },
  {
    question: "¿Se guarda mi progreso?",
    answer:
      "Tu progreso se guarda localmente en tu navegador, por lo que no necesitás crear una cuenta. Sin embargo, si limpiás los datos del navegador, perderás tu progreso.",
  },
  {
    question: "¿Puedo exportar mi plan de estudios?",
    answer: "Sí, podés exportar tu plan de estudios como imagen PNG para compartirlo o guardarlo.",
  },
  {
    question: "¿Cómo funcionan las correlativas?",
    answer:
      "El sistema detecta automáticamente las correlativas. Si desmarcás una materia, todas las materias que dependen de ella se bloquearán automáticamente.",
  },
]

export function FAQ() {
  return (
    <section className="py-24 md:py-32 dotted-background">
      <div className="container max-w-3xl mx-auto px-4 md:px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-6xl font-medium tracking-tight">Preguntas frecuentes</h2>
          <p className="text-base md:text-lg text-muted-foreground">Todo lo que necesitás saber sobre Titulito</p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-px bg-border">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border-0 bg-background px-6 data-[state=open]:bg-muted/30 transition-colors"
            >
              <AccordionTrigger className="text-left font-medium hover:no-underline py-6 text-sm md:text-base">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6 leading-relaxed text-sm">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
