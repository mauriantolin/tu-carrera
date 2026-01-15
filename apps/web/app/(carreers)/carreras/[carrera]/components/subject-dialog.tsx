"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Badge } from "@workspace/ui/components/badge"
import { BookOpen } from "lucide-react"
import { Subject } from '@/lib/subjects'
import type { Contenido } from '@/lib/types'

/**
 * Splitea contenidos para display:
 * - Si hay múltiples contenidos, los devuelve tal cual
 * - Si hay un solo contenido, lo splitea por "." (o ";" si no hay puntos)
 */
function splitContenidos(contenidos: Contenido[] | undefined): { contenido: string; id: string }[] {
  if (!contenidos || contenidos.length === 0) return []

  // Si ya hay múltiples contenidos, devolverlos tal cual
  if (contenidos.length > 1) {
    return contenidos.map(c => ({ contenido: c.contenido, id: c.id }))
  }

  // Si hay un solo contenido, splitearlo
  const texto = contenidos[0]?.contenido?.trim() || ''
  if (!texto) return []

  const separador = texto.includes('.') ? '.' : ';'
  const items = texto
    .split(separador)
    .map(s => s.trim())
    .filter(s => s.length > 0)

  return items.map((item, index) => ({
    contenido: item,
    id: `${contenidos[0]?.id}-${index}`
  }))
}

interface SubjectInfoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subject: Subject | null
}

export function SubjectInfoDialog({ open, onOpenChange, subject }: SubjectInfoDialogProps) {
  if (!subject) return null

  const displayContenidos = splitContenidos(subject.contenidos)
  const hasContenidos = displayContenidos.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] p-6 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <BookOpen className="h-5 w-5 text-primary" />
            {subject.nombre}
          </DialogTitle>
          <DialogDescription>
            <span className="text-sm">{subject.codigo}</span> • {subject.horas} horas
            {subject.prerrequisitos && (
              <span className="text-sm block mt-1">{subject.prerrequisitos}</span>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 max-h-[calc(85vh-12rem)] overflow-y-auto">
          <h4 className="text-sm font-semibold mb-3 text-foreground">Contenidos del curso:</h4>
          {hasContenidos ? (
            <ul className="space-y-2 pr-2">
              {displayContenidos.map((item, index) => (
                <li key={item.id} className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5 shrink-0">
                    {index + 1}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{item.contenido}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No hay contenidos disponibles para esta materia.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
