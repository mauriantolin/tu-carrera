/**
 * Sistema centralizado de z-index para evitar conflictos de stacking context.
 * Usar estos valores en lugar de números mágicos en los componentes.
 *
 * @example
 * ```tsx
 * import { Z_INDEX } from '@/lib/constants/z-index'
 *
 * <div className={`z-[${Z_INDEX.HEADER}]`}>Header</div>
 * // o con template string en style:
 * <div style={{ zIndex: Z_INDEX.HEADER }}>Header</div>
 * ```
 */
export const Z_INDEX = {
  /** Elementos base del contenido */
  BASE: 10,
  /** Controles de ReactFlow */
  FLOW_CONTROLS: 20,
  /** Header colapsable y floating toolbar */
  HEADER: 50,
  /** Badge de información de carrera */
  CAREER_BADGE: 55,
  /** Contenido de HoverCards y Popovers (por encima de nodos ReactFlow) */
  HOVER_CONTENT: 60,
  /** Modales y Dialogs */
  MODAL: 70,
  /** Toasts y notificaciones */
  TOAST: 80,
  /** Overlays críticos (ej: loading global) */
  OVERLAY: 90,
  /** Chat flotante */
  FLOATING_CHAT: 100,
} as const

/** Tipo para los valores de z-index */
export type ZIndexValue = (typeof Z_INDEX)[keyof typeof Z_INDEX]

/**
 * Helper para generar clase de Tailwind z-index arbitrario
 * @example zClass(Z_INDEX.HEADER) => "z-[50]"
 */
export const zClass = (value: number): string => `z-[${value}]`
