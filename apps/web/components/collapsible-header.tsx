"use client"

import { useEffect } from "react"
import { ChevronDown } from "lucide-react"
import SiteHeader from "@/components/site-header"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { useExpandableState } from "@/hooks/use-expandable-state"
import { ANIMATION_TIMING, Z_INDEX, TRANSITION_CLASS } from "@/lib/constants"

export function CollapsibleHeader() {
  const {
    isExpanded,
    isTransitioning,
    expand,
    collapse,
    collapseImmediate,
    toggle,
  } = useExpandableState({
    collapseDelay: ANIMATION_TIMING.COLLAPSE_DELAY_FAST,
    transitionDuration: ANIMATION_TIMING.TRANSITION_DURATION,
  })

  // Keyboard support: Escape to collapse immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isExpanded) {
        collapseImmediate()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isExpanded, collapseImmediate])

  return (
    <div
      className={cn(
        `fixed top-0 left-0 right-0 z-[${Z_INDEX.HEADER}]`,
        !isExpanded && "pointer-events-none"
      )}
      onMouseLeave={collapse}
      onMouseEnter={expand}
    >
      {/* Header con animación slide y padding top cuando expandido */}
      <div
        className={cn(
          `transition-all ${TRANSITION_CLASS} ease-out`,
          isExpanded ? "translate-y-0 pt-4 pointer-events-auto" : "-translate-y-full pt-0"
        )}
      >
        <SiteHeader />
      </div>

      {/* Flecha trigger - visible cuando header está oculto */}
      {/* Usamos pointer-events-none durante la transición para evitar flickering */}
      <div
        className={cn(
          `absolute left-1/2 -translate-x-1/2 transition-all ${TRANSITION_CLASS} ease-out pointer-events-auto`,
          isExpanded
            ? "top-20 opacity-0 pointer-events-none"
            : "top-2 opacity-100",
          isTransitioning && "pointer-events-none"
        )}
        onMouseEnter={expand}
      >
        <Button
          onClick={toggle}
          onFocus={expand}
          className={cn(
            "p-2 rounded-full backdrop-blur-sm border shadow-sm",
            "bg-background/80 border-border/50",
            "hover:bg-accent hover:scale-110",
            "transition-all duration-200",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-maroon focus-visible:ring-offset-2"
          )}
          aria-label={isExpanded ? "Ocultar menú de navegación" : "Mostrar menú de navegación"}
          aria-expanded={isExpanded}
        >
          <ChevronDown
            className={cn(
              `h-4 w-4 text-muted-foreground transition-transform ${TRANSITION_CLASS}`,
              isExpanded && "rotate-180"
            )}
          />
        </Button>
      </div>
    </div>
  )
}
