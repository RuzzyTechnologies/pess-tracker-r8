"use client"

import * as React from "react"
import { useData, getCurrentUser, isOnline, type Task, type User } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarClock, Users } from "lucide-react"

function statusPercent(s: Task["status"]) {
  return s === "Done" ? 100 : s === "In Progress" ? 60 : 10
}
function isOverdue(t: Task) {
  if (!t.dueDate) return false
  const due = new Date(t.dueDate).getTime()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return due < today.getTime() && t.status !== "Done"
}
function isDueThisWeek(t: Task) {
  if (!t.dueDate) return false
  const due = new Date(t.dueDate)
  const today = new Date()
  const in7 = new Date()
  in7.setDate(today.getDate() + 7)
  return due >= today && due <= in7
}

export default function StaffAssignedByMeView() {
  const [state, update] = useData((d) => ({ tasks: d.tasks, users: d.users }))
  const me = getCurrentUser()
  const meEmail = (me?.email || "").toLowerCase()

  // Periodic tick to re-evaluate derived things like "overdue" without writes
  const [, tick] = React.useReducer((x) => x + 1, 0)
  React.useEffect(() => {
    const t = setInterval(tick, 10_000)
    return () => clearInterval(t)
  }, [])

  const staff: User[] = React.useMemo(() => state.users.filter((u) => u.role === "staff"), [state.users])

  // Filters
  const [assigneeFilter, setAssigneeFilter] = React.useState<"others-or-unassigned" | "others" | "any" | "unassigned">(
    "others-or-unassigned",
  )
  const [statusFilter, setStatusFilter] = React.useState<Task["status"] | "all">("all")
  const [q, setQ] = React.useState("")

  // Base list: tasks I created
  const mine = React.useMemo(() => {
    if (!me) return []
    return state.tasks.filter((t) => t.createdById === me.id)
  }, [state.tasks, me])

  function resolveAssignee(t: Task, users: User[]) {
    const emailLower = (t.assignee || "").toLowerCase()
    if (emailLower) {
      const user = users.find((u) => u.email.toLowerCase() === emailLower)
      return { emailLower, user }
    }
    if (t.assigneeId) {
      const user = users.find((u) => u.id === t.assigneeId)
      const el = user?.email?.toLowerCase() || ""
      return { emailLower: el, user }
    }
    return { emailLower: "", user: undefined }
  }

  const items = React.useMemo(() => {
    return mine
      .filter((t) => {
        const { emailLower: assignee, user: assigneeUser } = resolveAssignee(t, state.users)

        // Assignee filter
        if (assigneeFilter === "others" && (!assignee || assignee === meEmail)) return false
        if (assigneeFilter === "others-or-unassigned" && assignee === meEmail) return false
        if (assigneeFilter === "unassigned" && !!assignee) return false
        // "any" passes everything

        // Status filter
        if (statusFilter !== "all" && t.status !== statusFilter) return false

        // Search by title or assignee email/name
        const term = q.trim().toLowerCase()
        if (term) {
          const hay = `${t.title} ${t.priority} ${t.status} ${assignee} ${assigneeUser?.name || ""}`.toLowerCase()
          if (!hay.includes(term)) return false
        }
        return true
      })
      .sort((a, b) => {
        // Overdue first
        const oA = Number(isOverdue(a))
        const oB = Number(isOverdue(b))
        if (oA !== oB) return oB - oA
        // Then due date asc
        const da = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY
        const db = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY
        if (da !== db) return da - db
        // Then status
        return a.status.localeCompare(b.status)
      })
  }, [mine, assigneeFilter, statusFilter, q, state.users, meEmail, tick])

  // KPIs
  const total = mine.length
  const assignedToOthers = mine.filter((t) => {
    const { emailLower: assignee } = resolveAssignee(t, state.users)
    return !!assignee && assignee !== meEmail
  }).length
  const done = mine.filter((t) => t.status === "Done").length
  const dueThisWk = mine.filter(isDueThisWeek).length
  const overdue = mine.filter(isOverdue).length
  const completionRate = total ? Math.round((done / total) * 100) : 0

  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-6 space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Assigned by Me</h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search tasks or assignees..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-9 w-[240px] border-sky-100 dark:border-slate-700"
          />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Kpi label="Created by me" value={String(total)} />
        <Kpi
          label="Assigned to others"
          value={String(assignedToOthers)}
          icon={<Users className="h-4 w-4 text-sky-600" />}
        />
        <Kpi
          label="Due this week"
          value={String(dueThisWk)}
          icon={<CalendarClock className="h-4 w-4 text-sky-600" />}
        />
        <Kpi label="Overdue" value={String(overdue)} />
        <Kpi label="Completion" value={`${completionRate}%`} />
      </div>

      {/* Filters */}
      <Card className="backdrop-blur supports-[backdrop-filter]:bg-white/75 border border-sky-100/70 shadow-sm dark:supports-[backdrop-filter]:bg-slate-900/70 dark:border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-slate-800 dark:text-slate-100">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <div className="text-xs text-slate-500 dark:text-slate-400">Assignee</div>
            <Select value={assigneeFilter} onValueChange={(v) => setAssigneeFilter(v as any)}>
              <SelectTrigger className="h-9 border-sky-100 dark:border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="others-or-unassigned">Others or Unassigned (default)</SelectItem>
                <SelectItem value="others">Others only</SelectItem>
                <SelectItem value="any">Any (including me)</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-slate-500 dark:text-slate-400">Status</div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter((v as Task["status"]) || "all")}>
              <SelectTrigger className="h-9 border-sky-100 dark:border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Todo">Todo</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-slate-500 dark:text-slate-400">Quick</div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="h-9 border-sky-200 text-sky-700 hover:bg-sky-50 bg-transparent dark:border-slate-700 dark:text-sky-300 dark:hover:bg-slate-800/60"
                onClick={() => {
                  setAssigneeFilter("others-or-unassigned")
                  setStatusFilter("all")
                  setQ("")
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card className="backdrop-blur supports-[backdrop-filter]:bg-white/75 border border-sky-100/70 shadow-sm dark:supports-[backdrop-filter]:bg-slate-900/70 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-800 dark:text-slate-100">Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {items.length === 0 ? (
            <div className="text-slate-500 dark:text-slate-400">
              No tasks match your filters. Try "Others or Unassigned" or set Status to "All".
            </div>
          ) : (
            items.map((t) => {
              const pct = statusPercent(t.status)
              const { user: assigneeUser } = resolveAssignee(t, state.users)
              const online = assigneeUser ? isOnline(assigneeUser) : false
              const dueText = t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "No due date"
              const overdueNow = isOverdue(t)
              return (
                <div
                  key={t.id}
                  className="flex flex-col gap-2 rounded-md border border-sky-100/70 bg-white/70 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900/70"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium text-slate-900 dark:text-slate-100">{t.title}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Status: {t.status}
                      {" • "}
                      Priority: {t.priority}
                      {" • "}
                      Due: {dueText}
                      {overdueNow ? (
                        <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-[10px] text-red-700 ring-1 ring-red-100">
                          Overdue
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-2 h-1.5 w-48 rounded-full bg-sky-50">
                      <div
                        className="h-1.5 rounded-full bg-sky-400/80"
                        style={{ width: `${pct}%` }}
                        aria-label={`Progress ${pct}%`}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={[
                          "inline-block h-2 w-2 rounded-full",
                          online ? "bg-emerald-500" : "bg-slate-400",
                        ].join(" ")}
                        title={online ? "Online" : "Offline"}
                        aria-label={online ? "Online" : "Offline"}
                      />
                      <span className="truncate">
                        {assigneeUser ? (
                          <>
                            <span className="font-medium text-slate-900 dark:text-slate-100">{assigneeUser.name}</span>{" "}
                            <span className="text-xs text-slate-500 dark:text-slate-400">({assigneeUser.email})</span>
                          </>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400">Unassigned</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Kpi({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/20 bg-white/10 p-3 shadow-lg backdrop-blur-md dark:border-slate-700/30 dark:bg-slate-900/10">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-slate-500 dark:text-white">{label}</div>
        {icon}
      </div>
      <div className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{value}</div>
    </div>
  )
}
