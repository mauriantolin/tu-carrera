import * as React from "react"
import { useTheme } from "next-themes"

export const META_THEME_COLORS = {
  light: "#ffffff",
  dark: "#161616",
}

export function useMetaColor() {
  const { resolvedTheme } = useTheme()

  const metaColor = React.useMemo(() => {
    return resolvedTheme !== "dark"
      ? META_THEME_COLORS.light
      : META_THEME_COLORS.dark
  }, [resolvedTheme])

  // Sincronizar automáticamente el meta tag cuando cambia el tema
  React.useEffect(() => {
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", metaColor)
  }, [metaColor])

  return { metaColor }
}