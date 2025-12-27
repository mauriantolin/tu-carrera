"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { Provider as JotaiProvider } from 'jotai'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <JotaiProvider>
      <NextThemesProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
        enableColorScheme
      >
        {children}
      </NextThemesProvider>
    </JotaiProvider>
  )
}
