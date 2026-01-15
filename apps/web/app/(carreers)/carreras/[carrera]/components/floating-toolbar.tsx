"use client"

import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"
import { RotateCcw, BookOpen, Move, Sparkles } from "lucide-react"
import { Z_INDEX } from "@/lib/constants"
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
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={`fixed bottom-8 right-10 z-[${Z_INDEX.HEADER}] flex flex-col-reverse items-center gap-3`}
        role="toolbar"
        aria-label="Herramientas del plan de estudios"
      >
        {/* Barra de herramientas - siempre visible */}
        <div className="flex flex-col items-center gap-4 w-20 pb-4 pt-4">
          {/* Botón de Rollback de Estado */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "h-12 w-12 rounded-full border-2 backdrop-blur-sm",
                  "bg-white/20 dark:bg-zinc-900/95",
                  "shadow-lg hover:border-maroon hover:bg-maroon/10 dark:hover:bg-maroon/10",
                  "transition-all duration-200 hover:scale-110",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-maroon"
                )}
                onClick={onRollbackState}
                aria-label="Resetear estado de materias aprobadas"
              >
                <RotateCcw className="h-5 w-5 text-black dark:text-white" />
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
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-maroon/30 floating-toolbar-ring" />
                <div className="absolute inset-0 rounded-full bg-maroon/20 floating-toolbar-ring-delayed" />

                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "h-12 w-12 rounded-full border-2 border-primary/10 backdrop-blur-sm",
                    "bg-primary/5 dark:bg-primary/10",
                    "shadow-lg hover:border-primary hover:bg-primary/15",
                    "transition-all duration-200 hover:scale-110",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  )}
                  onClick={() => setIsChatOpen(prev => !prev)}
                  aria-label="Titulín AI"
                >
                  <Sparkles className="h-5 w-5 text-primary" />
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-[200px]">
              <p className="font-medium">Titulín</p>
              <p className="text-xs text-muted-foreground">Pregunta sobre materias y contenidos</p>
            </TooltipContent>
          </Tooltip>
        </div>
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
