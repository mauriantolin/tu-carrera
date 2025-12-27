'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

interface UseExpandableStateOptions {
  /** Delay en ms antes de colapsar (default: 150) */
  collapseDelay?: number
  /** Duración de la transición CSS en ms (default: 300) */
  transitionDuration?: number
}

interface UseExpandableStateReturn {
  /** Si el elemento está expandido */
  isExpanded: boolean
  /** Si está en medio de una transición (útil para pointer-events-none) */
  isTransitioning: boolean
  /** Expandir el elemento (cancela cualquier colapso pendiente) */
  expand: () => void
  /** Colapsar con delay (para evitar flickering) */
  collapse: () => void
  /** Colapsar inmediatamente (sin delay, útil para Escape) */
  collapseImmediate: () => void
  /** Toggle entre expandido y colapsado */
  toggle: () => void
}

/**
 * Hook reutilizable para manejar estado expandible con debounce anti-flickering.
 *
 * @example
 * ```tsx
 * const { isExpanded, isTransitioning, expand, collapse, toggle } = useExpandableState({
 *   collapseDelay: 150,
 *   transitionDuration: 300,
 * })
 *
 * return (
 *   <div
 *     onMouseEnter={expand}
 *     onMouseLeave={collapse}
 *     className={isTransitioning ? 'pointer-events-none' : ''}
 *   >
 *     <button onClick={toggle} aria-expanded={isExpanded}>
 *       Toggle
 *     </button>
 *     {isExpanded && <Content />}
 *   </div>
 * )
 * ```
 */
export function useExpandableState(
  options?: UseExpandableStateOptions
): UseExpandableStateReturn {
  const { collapseDelay = 150, transitionDuration = 300 } = options ?? {}

  const [isExpanded, setIsExpanded] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const collapseTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Limpiar timeouts
  const clearTimeouts = useCallback(() => {
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current)
      collapseTimeoutRef.current = null
    }
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current)
      transitionTimeoutRef.current = null
    }
  }, [])

  // Expandir - cancela cualquier colapso pendiente
  const expand = useCallback(() => {
    clearTimeouts()
    setIsExpanded(true)
    setIsTransitioning(false)
  }, [clearTimeouts])

  // Colapsar con delay para evitar flickering
  const collapse = useCallback(() => {
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current)
    }

    collapseTimeoutRef.current = setTimeout(() => {
      setIsTransitioning(true)
      setIsExpanded(false)

      // Quitar estado de transición después de la animación CSS
      transitionTimeoutRef.current = setTimeout(() => {
        setIsTransitioning(false)
      }, transitionDuration)
    }, collapseDelay)
  }, [collapseDelay, transitionDuration])

  // Colapsar inmediatamente (útil para tecla Escape)
  const collapseImmediate = useCallback(() => {
    clearTimeouts()
    setIsTransitioning(true)
    setIsExpanded(false)

    transitionTimeoutRef.current = setTimeout(() => {
      setIsTransitioning(false)
    }, transitionDuration)
  }, [clearTimeouts, transitionDuration])

  // Toggle
  const toggle = useCallback(() => {
    if (isExpanded) {
      collapse()
    } else {
      expand()
    }
  }, [isExpanded, expand, collapse])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeouts()
    }
  }, [clearTimeouts])

  return {
    isExpanded,
    isTransitioning,
    expand,
    collapse,
    collapseImmediate,
    toggle,
  }
}
