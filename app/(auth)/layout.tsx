"use client"

import type React from "react"

import Link from "next/link"
import { KanbanSquare, ShieldCheck, Timer, BarChart3 } from "lucide-react"
import { motion } from "framer-motion"

function Background({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-svh bg-gradient-to-b from-sky-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-12 -left-12 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl dark:bg-slate-800/40" />
        <div className="absolute top-1/3 -right-16 h-72 w-72 rounded-full bg-sky-100/60 blur-3xl dark:bg-slate-700/40" />
        <div className="absolute bottom-[-6rem] left-1/4 h-96 w-96 rounded-full bg-sky-300/20 blur-3xl dark:bg-slate-600/30" />
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
          <motion.div
            className="hidden lg:block backdrop-blur supports-[backdrop-filter]:bg-white/75 rounded-2xl border border-sky-100/70 p-8 shadow-sm"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-600 text-white shadow-sm">
                <span className="text-sm font-bold">P</span>
              </div>
              <div>
                <div className="text-xl font-semibold tracking-tight text-slate-900">PESS Tracker</div>
                <p className="text-sm text-slate-500">Project Execution, Strategy, and Supervision</p>
              </div>
            </div>

            <h1 className="mb-2 text-2xl font-semibold text-slate-900">Plan, execute, and supervise with clarity</h1>
            <p className="mb-6 text-sm leading-relaxed text-slate-600">
              A clean, modern platform for projects, tasks, timelines, and team productivity. Built for startups, NGOs,
              and small teams.
            </p>

            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3 rounded-lg bg-sky-50/60 p-3">
                <KanbanSquare className="h-4 w-4 text-sky-700" />
                <span>Kanban-style task tracking and status workflows</span>
              </li>
              <li className="flex items-center gap-3 rounded-lg bg-sky-50/60 p-3">
                <Timer className="h-4 w-4 text-sky-700" />
                <span>Time tracking per task and daily logs</span>
              </li>
              <li className="flex items-center gap-3 rounded-lg bg-sky-50/60 p-3">
                <ShieldCheck className="h-4 w-4 text-sky-700" />
                <span>Role-based access with approvals</span>
              </li>
              <li className="flex items-center gap-3 rounded-lg bg-sky-50/60 p-3">
                <BarChart3 className="h-4 w-4 text-sky-700" />
                <span>Analytics and reporting for outcomes</span>
              </li>
            </ul>

            <div className="mt-6 text-xs text-slate-500">
              By continuing, you agree to our{" "}
              <a className="underline decoration-sky-400/60 underline-offset-2 hover:text-sky-700" href="#">
                Terms
              </a>{" "}
              and{" "}
              <a className="underline decoration-sky-400/60 underline-offset-2 hover:text-sky-700" href="#">
                Privacy Policy
              </a>
              .
            </div>
          </motion.div>

          {/* Right form panel */}
          <motion.div
            className="mx-auto w-full max-w-md"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <div className="mb-6 text-center lg:hidden">
              <Link href="/" className="inline-flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sky-600 text-white shadow-sm">
                  <span className="text-xs font-bold">P</span>
                </div>
                <span className="text-lg font-semibold tracking-tight text-slate-900">PESS Tracker</span>
              </Link>
              <p className="mt-1 text-xs text-slate-500">Project Execution, Strategy, and Supervision</p>
            </div>

            {children}

            <p className="mt-6 text-center text-xs text-slate-500">
              Demo authentication. Replace with NextAuth or your backend later.
            </p>
          </motion.div>
        </div>
      </main>
    </Background>
  )
}
