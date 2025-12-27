"use client"

import { useState, useCallback } from "react"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@workspace/ui/components/hover-card"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import { GraduationCap, Building2, FileText, User, BookOpen, Clock, ChevronDown } from "lucide-react"
import type { CarreraWithRelations } from "@/lib/types"
import type { ProcessedCurriculum } from "@/lib/subjects"
import { ANIMATION_TIMING, Z_INDEX } from "@/lib/constants"

interface CareerInfoHoverProps {
  carrera: CarreraWithRelations
  curriculum: ProcessedCurriculum
}

export function CareerInfoHover({ carrera, curriculum }: CareerInfoHoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const totalHoras = curriculum.subjects.reduce((sum, s) => sum + s.horas, 0)
  const totalMaterias = curriculum.subjects.length

  // Mejor soporte para touch/pen devices - solo toggle en estos dispositivos
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'touch' || e.pointerType === 'pen') {
      e.preventDefault()
      setIsOpen(prev => !prev)
    }
  }, [])

  // Click handler para mouse y keyboard
  const handleClick = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  return (
    <HoverCard
      open={isOpen}
      onOpenChange={setIsOpen}
      openDelay={ANIMATION_TIMING.HOVER_CARD_OPEN_DELAY}
      closeDelay={ANIMATION_TIMING.HOVER_CARD_CLOSE_DELAY}
    >
      <HoverCardTrigger asChild>
        <button
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full",
            "bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm",
            "border-2 border-maroon/30 shadow-lg",
            "text-sm font-semibold text-foreground",
            "hover:border-maroon hover:shadow-xl hover:scale-105",
            "active:scale-100", // Feedback visual para touch
            "transition-all duration-200",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-maroon focus-visible:ring-offset-2",
            "cursor-pointer select-none touch-manipulation" // Mejora touch handling
          )}
        >
          <GraduationCap className="h-4 w-4 text-maroon" />
          <ChevronDown
            className={cn(
              "h-3 w-3 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        className={`w-80 z-[${Z_INDEX.HOVER_CONTENT}]`}
        side="left"
        align="start"
        sideOffset={12}
        collisionPadding={20}
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-maroon/10 p-2 shrink-0">
              <GraduationCap className="h-5 w-5 text-maroon" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold leading-tight">{carrera.nombre}</h4>
              {carrera.facultad && (
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  <Building2 className="h-3 w-3 shrink-0" />
                  <span className="truncate">{carrera.facultad.nombre}</span>
                </p>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            {carrera.plan && (
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Plan</p>
                  <p className="font-medium truncate">{carrera.plan.codigo} ({carrera.plan.anio})</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Materias</p>
                <p className="font-medium">{totalMaterias}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Horas totales</p>
                <p className="font-medium">{totalHoras}h</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Badge variant="secondary" className="text-xs">
                {curriculum.maxYear} {curriculum.maxYear > 1 ? 'años' : 'año'}
              </Badge>
            </div>
          </div>

          {/* Director */}
          {carrera.director && (
            <div className="pt-3 border-t">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="h-3 w-3 shrink-0" />
                <span className="truncate">Director: {carrera.director.nombre}</span>
              </div>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
