"use client"

import type { ReactNode } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Preloader } from "@/components/preloader"

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="pess-theme"
      disableTransitionOnChange
    >
      {/* Preloader appears only on first load per tab, then never again */}
      <Preloader />
      {children}
    </ThemeProvider>
  )
}
