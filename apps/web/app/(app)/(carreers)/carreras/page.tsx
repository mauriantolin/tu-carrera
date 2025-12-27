import { Suspense } from "react"
import { PageContent } from "./components/page-content";
import { FacultiesContent } from "./components/faculties-content";

  
export default async function CarrerasPage() {  
  return (
    <>
      <Suspense fallback={<p>Loading..</p>}>
          <PageContent>
              <div className="text-center mb-16 space-y-4">
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] text-balance">
                  Seleccioná tu facultad
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
                  Elegí tu facultad para ver las carreras disponibles
                </p>
              </div>
              <Suspense fallback={<p>Loading faculties...</p>}>
                  <FacultiesContent />
              </Suspense>
          </PageContent>
      </Suspense>
    </>
  )
}
