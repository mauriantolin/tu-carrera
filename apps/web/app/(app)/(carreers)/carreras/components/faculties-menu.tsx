"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@workspace/ui/components/dialog"
import { CareerCard } from "./careers-card"
import { FacultadConCarreras } from "@/lib/types"

interface FacultyWithCareersProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  faculty: FacultadConCarreras | null
  careersLength: number
}

export function FacultiesMenu({ open, onOpenChange, faculty, careersLength }: FacultyWithCareersProps) {

  if (!faculty) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className=" max-w-xl max-h-[80vh] overflow-y-auto md:min-w-3xl">
        <FacultyMenuHeader facultyName={faculty.nombre}/>

        <div className="mt-6 space-y-4">
          {careersLength === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No hay carreras disponibles en esta facultad aún.</p>
            </div>
          ) : (
            faculty.carreras?.map((career) => (
              <CareerCard key={career.id} career={career} onOpenChange={onOpenChange} />
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function FacultyMenuHeader({ facultyName }: { facultyName?: string }) {
    return (
        <DialogHeader>
          <DialogTitle className="font-display text-2xl md:text-3xl text-foreground">{facultyName}</DialogTitle>
          <DialogDescription className="text-base">
            Seleccioná una carrera para ver su plan de estudios completo
          </DialogDescription>
        </DialogHeader>
    )
}

