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
      <div className="absolute inset-0 bg-gradient-to-b from-sky-50 to-white dark:from-slate-950 dark:to-slate-900" />

      <div className="relative mx-4 flex max-w-sm flex-col items-center gap-4 rounded-2xl border border-sky-100/70 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-6 text-center shadow-sm backdrop-blur-md">
        <div className="relative">
          <div className="absolute -inset-3 rounded-full bg-sky-400/15 blur-xl" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm sm:h-14 sm:w-14">
            <span className="text-lg font-bold sm:text-xl">P</span>
          </div>
        </div>

        <div>
          <div className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">PESS Tracker</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Project Execution, Strategy, and Supervision</div>
        </div>

        <div className="relative h-12 w-12 sm:h-14 sm:w-14">
          <div className="absolute -inset-2 rounded-full bg-sky-400/10 blur-lg" />
          <div className="absolute inset-0 rounded-full border-2 border-sky-200 dark:border-slate-700" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
          <div className="absolute inset-3 rounded-full bg-white/70 shadow-sm ring-1 ring-sky-100 dark:bg-slate-900/60 dark:ring-slate-800" />
        </div>

        <div className="h-1 w-48 overflow-hidden rounded-full bg-sky-100 dark:bg-slate-800">
          <div className="h-full w-1/3 animate-[loader_1.25s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-sky-500/80 via-sky-400/80 to-sky-600/80" />
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-300">{label}…</div>
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
