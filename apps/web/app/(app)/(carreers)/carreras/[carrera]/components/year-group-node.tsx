"use client"

import { memo } from "react"

interface YearGroupData {
  label: string
  year: string
}

// Colores pastel suaves por año (sin verde - reservado para completadas)
const YEAR_COLORS: Record<string, { bg: string; border: string }> = {
  '1': { bg: 'hsl(210 40% 80% / 0.25)', border: 'hsl(210 40% 65% / 0.35)' },  // Azul pastel
  '2': { bg: 'hsl(270 35% 82% / 0.25)', border: 'hsl(270 35% 68% / 0.35)' },  // Lavanda
  '3': { bg: 'hsl(45 45% 85% / 0.25)', border: 'hsl(45 45% 70% / 0.35)' },    // Crema/Amarillo pastel
  '4': { bg: 'hsl(340 40% 82% / 0.25)', border: 'hsl(340 40% 68% / 0.35)' },  // Rosa pastel
  '5': { bg: 'hsl(25 50% 82% / 0.25)', border: 'hsl(25 50% 68% / 0.35)' },    // Durazno
  '6': { bg: 'hsl(190 35% 80% / 0.25)', border: 'hsl(190 35% 65% / 0.35)' },  // Celeste
  '7': { bg: 'hsl(300 30% 82% / 0.25)', border: 'hsl(300 30% 68% / 0.35)' },  // Malva
  '8': { bg: 'hsl(180 30% 80% / 0.25)', border: 'hsl(180 30% 65% / 0.35)' },  // Menta suave
}

const DEFAULT_COLOR = { bg: 'hsl(0 0% 50% / 0.10)', border: 'hsl(0 0% 50% / 0.20)' }

export const YearGroupNode = memo(({ data }: { data: YearGroupData }) => {
  const { label, year } = data
  const colors = YEAR_COLORS[year] || DEFAULT_COLOR

  return (
    <div
      className="w-full h-full rounded-2xl"
      style={{
        backgroundColor: colors.bg,
        border: `2px solid ${colors.border}`,
        pointerEvents: 'none',
      }}
    >
      <div className="absolute top-5 left-7">
        <span
          className="text-7xl font-semibold tracking-tight"
          style={{
            color: colors.border.replace('/ 0.25)', '/ 0.7)'),
          }}
        >
          {label}
        </span>
      </div>
    </div>
  )
})

YearGroupNode.displayName = "YearGroupNode"
