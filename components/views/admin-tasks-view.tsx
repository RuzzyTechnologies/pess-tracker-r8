"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useData, type Task, type User } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Users } from "lucide-react"

function statusPercent(s: Task["status"]) {
  return s === "Done" ? 100 : s === "In Progress" ? 60 : 20
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

export default function AdminTasksView() {
  const router = useRouter()
  const [state, update] = useData((d) => ({ tasks: d.tasks, users: d.users }))
  const staff: User[] = React.useMemo(() => state.users.filter((u) => u.role === "staff"), [state.users])
  const usersById = React.useMemo(() => new Map(state.users.map((u) => [u.id, u] as const)), [state.users])

  // Filters
  const [assigneeFilter, setAssigneeFilter] = React.useState<string>("all") // 'all' | 'unassigned' | email
  const [statusFilter, setStatusFilter] = React.useState<Task["status"] | "all">("all")
  const [creatorFilter, setCreatorFilter] = React.useState<"all" | "staff">("all") // monitor staff→staff quickly
  const [q, setQ] = React.useState("")

  const isStaffEmail = React.useCallback(
    (email?: string) => !!email && staff.some((u) => u.email.toLowerCase() === email.toLowerCase()),
    [staff],
  )
  const createdByRole = React.useCallback(
    (t: Task): User["role"] | "unknown" => {
      const u = t.createdById ? usersById.get(t.createdById) : undefined
      return u?.role || "unknown"
    },
    [usersById],
  )

  // Metrics
  const total = state.tasks.length
  const assignedToStaff = state.tasks.filter((t) => isStaffEmail(t.assignee)).length
  const fromStaffToStaff = state.tasks.filter((t) => createdByRole(t) === "staff" && isStaffEmail(t.assignee)).length
  const overdue = state.tasks.filter((t) => isOverdue(t)).length
  const done = state.tasks.filter((t) => t.status === "Done").length
  const completionRate = total ? Math.round((done / total) * 100) : 0
  const dueThisWk = state.tasks.filter(isDueThisWeek).length

  // Per-assignee workload
  const perAssignee = React.useMemo(() => {
    const map = new Map<
      string,
      { name: string; email: string; todo: number; inProgress: number; done: number; overdue: number }
    >()
    staff.forEach((u) =>
      map.set(u.email.toLowerCase(), {
        name: u.name,
        email: u.email,
        todo: 0,
        inProgress: 0,
        done: 0,
        overdue: 0,
      }),
    )
    state.tasks.forEach((t) => {
      if (!t.assignee) return
      const key = t.assignee.toLowerCase()
      if (!map.has(key)) return
      const row = map.get(key)!
      if (t.status === "Todo") row.todo++
      else if (t.status === "In Progress") row.inProgress++
      else if (t.status === "Done") row.done++
      if (isOverdue(t)) row.overdue++
    })
    return Array.from(map.values()).sort((a, b) => b.todo + b.inProgress - (a.todo + a.inProgress))
  }, [state.tasks, staff])

  // Apply filters
  const items = React.useMemo(() => {
    return state.tasks
      .filter((t) => {
        // Assignee filter
        if (assigneeFilter !== "all") {
          if (assigneeFilter === "unassigned") {
            if (t.assignee) return false
          } else if ((t.assignee || "").toLowerCase() !== assigneeFilter.toLowerCase()) {
            return false
          }
        }
        // Status filter
        if (statusFilter !== "all" && t.status !== statusFilter) return false
        // Creator filter
        if (creatorFilter === "staff" && createdByRole(t) !== "staff") return false
        // Search
        const term = q.trim().toLowerCase()
        if (term && !t.title.toLowerCase().includes(term)) return false
        return true
      })
      .sort((a, b) => {
        // Prioritize overdue, then due date, then status
        const oA = Number(isOverdue(a))
        const oB = Number(isOverdue(b))
        if (oA !== oB) return oB - oA
        const da = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY
        const db = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY
        if (da !== db) return da - db
        return a.status.localeCompare(b.status)
      })
  }, [state.tasks, assigneeFilter, statusFilter, creatorFilter, q, createdByRole])

  const setStatus = (id: string, status: Task["status"]) =>
    update((d) => ({ ...d, tasks: d.tasks.map((t) => (t.id === id ? { ...t, status } : t)) }))

  const setAssignee = (id: string, email: string | undefined) =>
    update((d) => ({ ...d, tasks: d.tasks.map((t) => (t.id === id ? { ...t, assignee: email } : t)) }))

  const onDelete = (id: string) => update((d) => ({ ...d, tasks: d.tasks.filter((t) => t.id !== id) }))

  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-6 space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Tasks</h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search tasks..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-9 w-[220px] border-sky-100 dark:border-slate-700"
          />
          <Button className="bg-sky-600 text-white hover:bg-sky-700" onClick={() => router.push("/admin/tasks/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Kpi label="Total" value={String(total)} />
        <Kpi label="Assigned to Staff" value={String(assignedToStaff)} />
        <Kpi label="Staff → Staff" value={String(fromStaffToStaff)} icon={<Users className="h-4 w-4 text-sky-600" />} />
        <Kpi label="Due This Week" value={String(dueThisWk)} />
        <Kpi label="Completion" value={`${completionRate}%`} />
      </div>

      {/* Filters */}
      <Card className="backdrop-blur-lg supports-[backdrop-filter]:bg-white/10 border border-white/20 shadow-lg dark:supports-[backdrop-filter]:bg-slate-900/10 dark:border-slate-700/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-foreground">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Assignee</div>
            <Select value={assigneeFilter} onValueChange={(v) => setAssigneeFilter(v)}>
              <SelectTrigger className="h-9 border-white/20 dark:border-slate-700/30 bg-white/10 dark:bg-slate-900/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All staff</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {staff.map((u) => (
                  <SelectItem key={u.id} value={u.email.toLowerCase()}>
                    {u.name} ({u.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Status</div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter((v as Task["status"]) || "all")}>
              <SelectTrigger className="h-9 border-white/20 dark:border-slate-700/30 bg-white/10 dark:bg-slate-900/10">
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
            <div className="text-xs text-muted-foreground">Created by</div>
            <Select value={creatorFilter} onValueChange={(v) => setCreatorFilter(v as "all" | "staff")}>
              <SelectTrigger className="h-9 border-white/20 dark:border-slate-700/30 bg-white/10 dark:bg-slate-900/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="staff">Staff-created</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Per-assignee workload */}
      <Card className="backdrop-blur-lg supports-[backdrop-filter]:bg-white/10 border border-white/20 shadow-lg dark:supports-[backdrop-filter]:bg-slate-900/10 dark:border-slate-700/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-foreground">Workload by assignee</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {perAssignee.map((row) => {
            const totalOpen = row.todo + row.inProgress
            const pct = totalOpen + row.done > 0 ? Math.round((row.done / (totalOpen + row.done)) * 100) : 0
            return (
              <div
                key={row.email}
                className="rounded-md border border-white/20 bg-white/10 p-3 text-sm backdrop-blur-md dark:border-slate-700/30 dark:bg-slate-900/10"
              >
                <div className="flex items-center justify-between">
                  <div className="truncate font-medium text-foreground">{row.name}</div>
                  <div className="text-xs text-muted-foreground">{pct}% done</div>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-white/20 dark:bg-slate-700/30">
                  <div className="h-2 rounded-full bg-primary/70" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Todo {row.todo} • In Progress {row.inProgress} • Done {row.done}
                  {row.overdue > 0 ? (
                    <span className="ml-2 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] text-red-400 ring-1 ring-red-500/30">
                      {row.overdue} overdue
                    </span>
                  ) : null}
                </div>
              </div>
            )
          })}
          {perAssignee.length === 0 && <div className="p-3 text-sm text-muted-foreground">No staff users found.</div>}
        </CardContent>
      </Card>

      {/* All tasks (filtered) with assignment controls */}
      <Card className="backdrop-blur-lg supports-[backdrop-filter]:bg-white/10 border border-white/20 shadow-lg dark:supports-[backdrop-filter]:bg-slate-900/10 dark:border-slate-700/30">
        <CardHeader>
          <CardTitle className="text-foreground">Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {items.length === 0 ? (
            <div className="text-muted-foreground">No tasks match your filters.</div>
          ) : (
            items.map((t) => {
              const creator = t.createdById ? usersById.get(t.createdById) : undefined
              const assigneeEmail = t.assignee ?? "unassigned"
              const overdueNow = isOverdue(t)
              const pct = statusPercent(t.status)
              const dueText = t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "No due date"
              return (
                <div
                  key={t.id}
                  className="flex flex-col gap-3 rounded-md border border-white/20 bg-white/10 p-3 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between dark:border-slate-700/30 dark:bg-slate-900/10"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium text-foreground">{t.title}</div>
                    <div className="text-xs text-muted-foreground">
                      Priority: {t.priority}
                      {" • "}
                      Status: {t.status}
                      {" • "}
                      Due: {dueText}
                      {creator ? ` • By: ${creator.name}` : ""}
                      {overdueNow ? (
                        <span className="ml-2 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] text-red-400 ring-1 ring-red-500/30">
                          Overdue
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-2 h-1.5 w-48 rounded-full bg-white/20 dark:bg-slate-700/30">
                      <div
                        className="h-1.5 rounded-full bg-primary/80"
                        style={{ width: `${pct}%` }}
                        aria-label={`Progress ${pct}%`}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Assignee */}
                    <Select
                      value={assigneeEmail}
                      onValueChange={(v) => setAssignee(t.id, v === "unassigned" ? undefined : v)}
                    >
                      <SelectTrigger className="h-8 w-[220px] border-white/20 dark:border-slate-700/30 bg-white/10 dark:bg-slate-900/10">
                        <SelectValue placeholder="Assign to staff" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {staff.map((u) => (
                          <SelectItem key={u.id} value={u.email}>
                            {u.name} ({u.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Status */}
                    <Select value={t.status} onValueChange={(v) => setStatus(t.id, v as Task["status"])}>
                      <SelectTrigger className="h-8 w-[150px] border-white/20 dark:border-slate-700/30 bg-white/10 dark:bg-slate-900/10">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Todo">Todo</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Done">Done</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Delete */}
                    <Button
                      variant="outline"
                      className="h-8 border-red-500/30 text-red-400 hover:bg-red-500/20 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/20 bg-transparent backdrop-blur-sm"
                      onClick={() => onDelete(t.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
