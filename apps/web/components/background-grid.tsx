"use client"

import { useTheme } from "next-themes"
import { useMemo, useEffect, useState } from "react"

interface BackgroundGridProps {
  color?: string
  darkColor?: string
  grid?: boolean
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '')
  const r = parseInt(cleanHex.substring(0, 2), 16)
  const g = parseInt(cleanHex.substring(2, 4), 16)
  const b = parseInt(cleanHex.substring(4, 6), 16)
  return { r, g, b }
}

export default function BackgroundGrid({
  color = '#000000',
  darkColor = '#ff99cc',
  grid = true
}: BackgroundGridProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const gradients = useMemo(() => {
    // Use light theme as default during SSR to avoid hydration mismatch
    const isDark = mounted && resolvedTheme === 'dark'
    const activeColor = isDark ? darkColor : color
    const { r, g, b } = hexToRgb(activeColor)

    // Higher opacity for dark mode since the color needs to stand out against dark bg
    const radialOpacity1 = isDark ? 0.2 : 0.15
    const radialOpacity2 = isDark ? 0.05 : 0.02
    const gridOpacity = isDark ? 0.08 : 0.04

    const radialGradient = `radial-gradient(circle at 30% 20%, rgba(${r}, ${g}, ${b}, ${radialOpacity1}), transparent 70%), radial-gradient(circle at 70% 60%, rgba(${r}, ${g}, ${b}, ${radialOpacity2}), transparent 50%)`
    const linearGradient = grid ? `linear-gradient(to right, rgba(${r}, ${g}, ${b}, ${gridOpacity}) 1px, transparent 1px), linear-gradient(to bottom, rgba(${r}, ${g}, ${b}, ${gridOpacity}) 1px, transparent 1px)` : ''

    return { radialGradient, linearGradient }
  }, [mounted, resolvedTheme, color, darkColor, grid])

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <div
        className="absolute inset-0"
        style={{ backgroundImage: gradients.radialGradient }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: gradients.linearGradient,
          backgroundSize: '24px 24px'
        }}
      />
    </div>
  )
}
