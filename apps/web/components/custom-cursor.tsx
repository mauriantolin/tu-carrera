"use client"

import { useEffect, useState, useCallback } from "react"
import { cn } from "@workspace/ui/lib/utils"

const CURSOR_CLASS = "hide-cursor"

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isPointer, setIsPointer] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  const updateCursor = useCallback((e: MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY })

    const target = e.target as HTMLElement
    const computedStyle = window.getComputedStyle(target)
    const isClickable =
      computedStyle.cursor === "pointer" ||
      target.tagName === "A" ||
      target.tagName === "BUTTON" ||
      target.closest("a") ||
      target.closest("button") ||
      target.getAttribute("role") === "button"

    setIsPointer(!!isClickable)
  }, [])

  const handleMouseEnter = useCallback(() => setIsVisible(true), [])
  const handleMouseLeave = useCallback(() => setIsVisible(false), [])

  // Add/remove cursor hiding class on mount/unmount
  useEffect(() => {
    document.documentElement.classList.add(CURSOR_CLASS)
    setMounted(true)

    return () => {
      document.documentElement.classList.remove(CURSOR_CLASS)
    }
  }, [])

  useEffect(() => {
    document.addEventListener("mousemove", updateCursor)
    document.addEventListener("mouseenter", handleMouseEnter)
    document.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      document.removeEventListener("mousemove", updateCursor)
      document.removeEventListener("mouseenter", handleMouseEnter)
      document.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [updateCursor, handleMouseEnter, handleMouseLeave])

  // Hide on touch devices
  if (typeof window !== "undefined" && "ontouchstart" in window) {
    return null
  }

  if (!mounted) return null

  return (
    <>
      {/* Custom cursor dot */}
      <div
        className={cn(
          "fixed pointer-events-none z-[9999] transition-opacity duration-150",
          isVisible ? "opacity-100" : "opacity-0"
        )}
        style={{
          left: position.x,
          top: position.y,
          transform: "translate(-50%, -50%)",
        }}
      >
        {/* Small center dot */}
        <div
          className={cn(
            "rounded-full bg-foreground transition-all duration-150",
            isPointer ? "w-2 h-2" : "w-1.5 h-1.5"
          )}
        />
      </div>

      {/* Circle with inverted backdrop */}
      <div
        className={cn(
          "fixed pointer-events-none z-[9998] rounded-full transition-all duration-200 ease-out delay-10 ",
          isVisible ? "opacity-100" : "opacity-0",
          isPointer ? "scale-200" : "scale-120"
        )}
        style={{
          left: position.x,
          top: position.y,
          transform: "translate(-50%, -50%)",
          width: 32,
          height: 32,
          backdropFilter: "invert(1)",
          WebkitBackdropFilter: "invert(1)",
        }}
      />
    </>
  )
}
