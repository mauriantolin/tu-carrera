/**
 * Constantes de timing para animaciones.
 * Estos valores deben coincidir con las clases de Tailwind usadas (duration-300, etc.)
 */
export const ANIMATION_TIMING = {
  /** Delay antes de colapsar el header (ms) */
  COLLAPSE_DELAY_FAST: 150,
  /** Delay antes de colapsar el toolbar (ms) */
  COLLAPSE_DELAY_NORMAL: 200,
  /** Duración de las transiciones CSS (ms) - coincide con duration-300 */
  TRANSITION_DURATION: 300,
  /** Delay antes de cerrar HoverCards (ms) */
  HOVER_CARD_CLOSE_DELAY: 300,
  /** Delay antes de abrir HoverCards (ms) */
  HOVER_CARD_OPEN_DELAY: 100,
  /** Duración de la animación de shaking (ms) */
  SHAKE_DURATION: 1400,
} as const

/** Tipo para los valores de timing */
export type AnimationTiming = typeof ANIMATION_TIMING

/**
 * Clase de Tailwind correspondiente a TRANSITION_DURATION.
 * Usar esta constante para mantener sincronización CSS/JS.
 */
export const TRANSITION_CLASS = 'duration-300' as const
