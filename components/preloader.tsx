"use client"

import * as React from "react"

export function Preloader({
  showOncePerSession = true,
  minVisibleMs = 700,
  maxVisibleMs = 2000,
  label = "Loading",
}: {
  showOncePerSession?: boolean
  minVisibleMs?: number
  maxVisibleMs?: number
  label?: string
}) {
  const [show, setShow] = React.useState(false)

  React.useEffect(() => {
    const KEY = "pess:preloader-shown"
    const alreadyShown = showOncePerSession && typeof window !== "undefined" && sessionStorage.getItem(KEY) === "1"

    if (alreadyShown) {
      setShow(false)
      return
    }
    setShow(true)

    const start = performance.now()
    const maxTimer = window.setTimeout(() => setShow(false), maxVisibleMs)

    const finish = () => {
      const elapsed = performance.now() - start
      const remaining = Math.max(0, minVisibleMs - elapsed)
      window.setTimeout(() => {
        setShow(false)
        if (showOncePerSession) sessionStorage.setItem(KEY, "1")
      }, remaining)
    }

    if ("requestIdleCallback" in window) {
      ;(window as any).requestIdleCallback(() => finish())
    } else {
      requestAnimationFrame(() => finish())
    }

    return () => {
      window.clearTimeout(maxTimer)
    }
  }, [showOncePerSession, minVisibleMs, maxVisibleMs])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[200] grid place-items-center" role="status" aria-live="polite" aria-label={label}>
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 to-background/95 backdrop-blur-sm" />

      <div className="relative mx-4 flex max-w-sm flex-col items-center gap-4 rounded-2xl border border-white/20 dark:border-slate-700/30 bg-white/10 dark:bg-slate-900/10 p-6 text-center shadow-lg backdrop-blur-lg">
        <div className="relative">
          <div className="absolute -inset-3 rounded-full bg-primary/15 blur-xl" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm sm:h-14 sm:w-14">
            <span className="text-lg font-bold sm:text-xl">P</span>
          </div>
        </div>

        <div>
          <div className="text-base font-semibold tracking-tight text-foreground">PESS Tracker</div>
          <div className="text-xs text-muted-foreground">Project Execution, Strategy, and Supervision</div>
        </div>

        <div className="relative h-12 w-12 sm:h-14 sm:w-14">
          <div className="absolute -inset-2 rounded-full bg-primary/10 blur-lg" />
          <div className="absolute inset-0 rounded-full border-2 border-white/20 dark:border-slate-700/30" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <div className="absolute inset-3 rounded-full bg-white/10 backdrop-blur-md shadow-sm ring-1 ring-white/20 dark:bg-slate-900/10 dark:ring-slate-700/30" />
        </div>

        <div className="h-1 w-48 overflow-hidden rounded-full bg-white/20 backdrop-blur-md dark:bg-slate-800/20">
          <div className="h-full w-1/3 animate-[loader_1.25s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-primary/80 via-primary/60 to-primary/80" />
        </div>

        <div className="text-xs text-muted-foreground">{label}…</div>
      </div>

      <style>{`
        @keyframes loader {
          0% { transform: translateX(-120%); }
          50% { transform: translateX(30%); }
          100% { transform: translateX(180%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-spin { animation: none !important; }
          .animate-[loader_1.25s_ease-in-out_infinite] { animation: none !important; }
        }
      `}</style>
    </div>
  )
}
