"use client"

import { useId, useState } from "react"
import { Button } from "@workspace/ui/components/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"
import { RotateCcw, BookOpen, Move, Sparkles } from "lucide-react"
import { useExpandableState } from "@/hooks/use-expandable-state"
import { ANIMATION_TIMING, Z_INDEX, TRANSITION_CLASS } from "@/lib/constants"
import { CareerInfoHover } from "./career-info-hover"
import { AIChat } from "./ai-chat"
import type { CarreraWithRelations } from "@/lib/types"
import type { ProcessedCurriculum } from "@/lib/subjects"

interface FloatingToolbarClientProps {
  onRollbackState?: () => void
  onRollbackPositions?: () => void
  carreraInfo?: CarreraWithRelations | null
  curriculum?: ProcessedCurriculum
}

export function FloatingToolbarClient({
  onRollbackState,
  onRollbackPositions,
  carreraInfo,
  curriculum,
}: FloatingToolbarClientProps) {
  const toolsId = useId()
  const [isChatOpen, setIsChatOpen] = useState(false)

  const { isExpanded, isTransitioning, expand, collapse } = useExpandableState({
    collapseDelay: ANIMATION_TIMING.COLLAPSE_DELAY_NORMAL,
    transitionDuration: ANIMATION_TIMING.TRANSITION_DURATION,
  })

  return (
    <TooltipProvider delayDuration={ANIMATION_TIMING.TRANSITION_DURATION}>
      <div
        className={`fixed bottom-8 right-10 z-[${Z_INDEX.HEADER}] flex flex-col-reverse items-center gap-3`}
        role="toolbar"
        aria-label="Herramientas del plan de estudios"
        onMouseEnter={expand}
        onMouseLeave={collapse}
      >
        {/* Barra de herramientas expandible - controlada por estado */}
        <div
          id={toolsId}
          className={cn(
            `flex flex-col items-center gap-4 overflow-hidden transition-all ${TRANSITION_CLASS} ease-out w-20`,
            isExpanded
              ? "max-h-[400px] pb-4 pt-4 opacity-100"
              : "max-h-0 opacity-0",
            isTransitioning && "pointer-events-none"
          )}
        >
          {/* Botón de Rollback de Estado */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "h-12 w-12 rounded-full border-2 border-maroon/50 backdrop-blur-sm",
                  "bg-white/95 dark:bg-zinc-900/95",
                  "shadow-lg hover:border-maroon hover:bg-maroon/10 dark:hover:bg-maroon/10",
                  "transition-all duration-200 hover:scale-110",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-maroon"
                )}
                onClick={onRollbackState}
                aria-label="Resetear estado de materias aprobadas"
              >
                <RotateCcw className="h-5 w-5 text-maroon dark:text-white" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-[200px]">
              <p className="font-medium">Resetear materias</p>
              <p className="text-xs text-muted-foreground">Quita todas las materias aprobadas</p>
            </TooltipContent>
          </Tooltip>

          {/* Botón de Rollback de Posiciones */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "h-12 w-12 rounded-full border-2 border-maroon/50 backdrop-blur-sm",
                  "bg-white/95 dark:bg-zinc-900/95",
                  "shadow-lg hover:border-maroon hover:bg-maroon/10 dark:hover:bg-maroon/10",
                  "transition-all duration-200 hover:scale-110",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-maroon"
                )}
                onClick={onRollbackPositions}
                aria-label="Restaurar posiciones de nodos"
              >
                <Move className="h-5 w-5 text-maroon dark:text-white" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-[200px]">
              <p className="font-medium">Restaurar posiciones</p>
              <p className="text-xs text-muted-foreground">Vuelve los nodos a su posición original</p>
            </TooltipContent>
          </Tooltip>

          {/* Botón de Info de Carrera */}
          {carreraInfo && curriculum && (
            <CareerInfoHover carrera={carreraInfo} curriculum={curriculum} />
          )}

          {/* Botón de Asistente AI */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "h-12 w-12 rounded-full border-2 border-primary/50 backdrop-blur-sm",
                  "bg-primary/5 dark:bg-primary/10",
                  "shadow-lg hover:border-primary hover:bg-primary/15",
                  "transition-all duration-200 hover:scale-110",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                )}
                onClick={() => setIsChatOpen(true)}
                aria-label="Titulín AI"
              >
                <Sparkles className="h-5 w-5 text-primary" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-[200px]">
              <p className="font-medium">Titulín</p>
              <p className="text-xs text-muted-foreground">Pregunta sobre materias y contenidos</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Círculo principal con efecto glow */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-maroon/30 floating-toolbar-ring" />
              <div className="absolute inset-0 rounded-full bg-maroon/20 floating-toolbar-ring-delayed" />

              <Button
                variant="default"
                size="icon"
                className={cn(
                  "relative h-14 w-14 rounded-full",
                  "bg-gradient-to-br from-maroon to-maroon/80",
                  "hover:from-maroon/90 hover:to-maroon/70",
                  "floating-toolbar-glow",
                  "transition-transform duration-200",
                  isExpanded && "scale-110"
                )}
                aria-label="Herramientas del plan de estudios"
                aria-controls={toolsId}
                aria-expanded={isExpanded}
              >
                <BookOpen className="h-6 w-6 text-white" />
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Herramientas</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Chat AI */}
      <AIChat
        open={isChatOpen}
        onOpenChange={setIsChatOpen}
        careerId={carreraInfo?.id}
      />
    </TooltipProvider>
  )
}
