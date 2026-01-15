"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import { useMetaColor } from "@/hooks/use-meta-color"
import { Button } from "@workspace/ui/components/button"
import { Moon, Sun } from "lucide-react"

export function ModeSwitcher() {
  const { setTheme, resolvedTheme } = useTheme()
  useMetaColor() // Sincroniza el meta tag automáticamente

  const toggleTheme = React.useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }, [resolvedTheme, setTheme])

  return (
    <Button
      variant="ghost"
      size="icon"
      className="group/toggle extend-touch-target size-8"
      onClick={toggleTheme}
      title="Toggle theme"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}