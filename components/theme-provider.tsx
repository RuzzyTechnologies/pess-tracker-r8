"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: Omit<ThemeProviderProps, "disableTransitionOnChange"> & {
  disableTransitionOnChange?: boolean
}) {
  return (
    <NextThemesProvider attribute="class" enableSystem defaultTheme="system" {...props}>
      {children}
    </NextThemesProvider>
  )
}
