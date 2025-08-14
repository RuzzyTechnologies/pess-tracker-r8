"use client"

export function PageLoader({
  show = true,
  label = "Loading",
}: {
  show?: boolean
  label?: string
}) {
  if (!show) return null

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-white/10 backdrop-blur-lg dark:bg-slate-950/10"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12 sm:h-14 sm:w-14">
          <div className="absolute -inset-1 rounded-full bg-primary/15 blur-md" />
          <div className="absolute inset-0 rounded-full border-2 border-white/20 dark:border-slate-700/30" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <div className="absolute inset-2 rounded-full bg-white/10 backdrop-blur-md shadow-sm ring-1 ring-white/20 dark:bg-slate-900/10 dark:ring-slate-700/30" />
        </div>

        <div className="h-1 w-48 overflow-hidden rounded-full bg-white/20 backdrop-blur-md dark:bg-slate-800/20">
          <div className="h-full w-1/3 animate-[loader_1.25s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-primary/80 via-primary/60 to-primary/80" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground">PESS Tracker</span>
          <span className="text-xs text-muted-foreground">{label}…</span>
        </div>
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
