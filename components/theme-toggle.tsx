"use client"
import * as React from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="opacity-50 pointer-events-none">
        <Moon className="h-5 w-5" />
      </Button>
    )
  }

  const isDark = resolvedTheme === "dark"
  const label = isDark ? "Switch to light mode" : "Switch to dark mode"

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            aria-label={label}
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="text-slate-700 hover:text-sky-700 dark:text-slate-200 dark:hover:text-sky-300"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{isDark ? "Light mode" : "Dark mode"}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
