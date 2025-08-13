"use client"
import * as React from "react"

type Theme = "light" | "dark" | "system"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: "light" | "dark"
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  storageKey = "theme",
}: {
  children: React.ReactNode
  attribute?: string
  defaultTheme?: Theme
  enableSystem?: boolean
  storageKey?: string
}) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">("light")

  React.useEffect(() => {
    // Load theme from localStorage
    const stored = localStorage.getItem(storageKey) as Theme
    if (stored && ["light", "dark", "system"].includes(stored)) {
      setThemeState(stored)
    }
  }, [storageKey])

  React.useEffect(() => {
    const getSystemTheme = (): "light" | "dark" => {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }

    const applyTheme = (newTheme: Theme) => {
      const resolved = newTheme === "system" ? getSystemTheme() : newTheme
      setResolvedTheme(resolved)

      if (attribute === "class") {
        document.documentElement.classList.remove("light", "dark")
        document.documentElement.classList.add(resolved)
      }

      document.documentElement.setAttribute("data-theme", resolved)
      document.documentElement.style.colorScheme = resolved
    }

    applyTheme(theme)

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => {
      if (theme === "system") {
        applyTheme(theme)
      }
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [theme, attribute])

  const setTheme = React.useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme)
      localStorage.setItem(storageKey, newTheme)
    },
    [storageKey],
  )

  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
      resolvedTheme,
    }),
    [theme, setTheme, resolvedTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
