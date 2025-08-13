"use client"

import type { ReactNode } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Preloader } from "@/components/preloader"
import "./globals.css"

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-svh bg-background text-foreground antialiased">
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
      </body>
    </html>
  )
}
