"use client"

import type React from "react"

import Link from "next/link"
const KanbanSquare = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="3" rx="1" strokeWidth={2} />
    <rect x="3" y="8" width="7" height="5" rx="1" strokeWidth={2} />
    <rect x="14" y="3" width="7" height="5" rx="1" strokeWidth={2} />
    <rect x="14" y="10" width="7" height="3" rx="1" strokeWidth={2} />
  </svg>
)

const ShieldCheck = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const Timer = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" strokeWidth={2} />
    <polyline points="12,6 12,12 16,14" strokeWidth={2} />
  </svg>
)

const BarChart3 = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13l4-4 4 4 8-8" />
    <rect x="3" y="17" width="4" height="4" strokeWidth={2} />
    <rect x="10" y="13" width="4" height="8" strokeWidth={2} />
    <rect x="17" y="9" width="4" height="12" strokeWidth={2} />
  </svg>
)

function Background({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-svh bg-gradient-to-b from-background to-muted dark:from-background dark:to-muted">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-12 -left-12 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-1/3 -right-16 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-6rem] left-1/4 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
      </div>
      {children}
    </div>
  )
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Background>
      <main className="h-svh overflow-y-auto">
        <div className="mx-auto grid min-h-full w-full max-w-6xl grid-cols-1 items-center gap-8 px-4 py-10 md:px-6 lg:grid-cols-2">
          {/* Left hero panel - lg+ only */}
          <div className="hidden lg:block backdrop-blur supports-[backdrop-filter]:bg-card/75 rounded-2xl border border-border p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <span className="text-sm font-bold">P</span>
              </div>
              <div>
                <div className="text-xl font-semibold tracking-tight text-foreground">PESS Tracker</div>
                <p className="text-sm text-muted-foreground">Project Execution, Strategy, and Supervision</p>
              </div>
            </div>

            <h1 className="mb-2 text-2xl font-semibold text-foreground">Plan, execute, and supervise with clarity</h1>
            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
              A clean, modern platform for projects, tasks, timelines, and team productivity. Built for startups, NGOs,
              and small teams.
            </p>

            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3 rounded-lg bg-muted/60 p-3">
                <KanbanSquare className="h-4 w-4 text-primary" />
                <span className="text-foreground">Kanban-style task tracking and status workflows</span>
              </li>
              <li className="flex items-center gap-3 rounded-lg bg-muted/60 p-3">
                <Timer className="h-4 w-4 text-primary" />
                <span className="text-foreground">Time tracking per task and daily logs</span>
              </li>
              <li className="flex items-center gap-3 rounded-lg bg-muted/60 p-3">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-foreground">Role-based access with approvals</span>
              </li>
              <li className="flex items-center gap-3 rounded-lg bg-muted/60 p-3">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span className="text-foreground">Analytics and reporting for outcomes</span>
              </li>
            </ul>

            <div className="mt-6 text-xs text-muted-foreground">
              By continuing, you agree to our{" "}
              <a className="underline decoration-primary/60 underline-offset-2 hover:text-primary" href="#">
                Terms
              </a>{" "}
              and{" "}
              <a className="underline decoration-primary/60 underline-offset-2 hover:text-primary" href="#">
                Privacy Policy
              </a>
              .
            </div>
          </div>

          {/* Right form panel */}
          <div className="mx-auto w-full max-w-md">
            <div className="mb-6 text-center lg:hidden">
              <Link href="/" className="inline-flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                  <span className="text-xs font-bold">P</span>
                </div>
                <span className="text-lg font-semibold tracking-tight text-foreground">PESS Tracker</span>
              </Link>
              <p className="mt-1 text-xs text-muted-foreground">Project Execution, Strategy, and Supervision</p>
            </div>

            {children}

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Demo authentication. Replace with NextAuth or your backend later.
            </p>
          </div>
        </div>
      </main>
    </Background>
  )
}
