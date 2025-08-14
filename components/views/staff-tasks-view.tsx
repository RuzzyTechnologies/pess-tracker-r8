"use client"
import { useRouter } from "next/navigation"
import * as React from "react"
import { useData, getCurrentUser, type Task, type User } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"

export default function StaffTasksView() {
  const router = useRouter()
  const [state, update] = useData((d) => ({ tasks: d.tasks, users: d.users }))
  const me = getCurrentUser()
  const staff: User[] = React.useMemo(() => state.users.filter((u) => u.role === "staff"), [state.users])

  const myTasks = React.useMemo(() => {
    if (!me) return []
    const email = (me.email || "").toLowerCase()
    return state.tasks.filter((t) => (t.assignee || "").toLowerCase() === email)
  }, [state.tasks, me])

  const setStatus = (id: string, status: Task["status"]) =>
    update((d) => ({ ...d, tasks: d.tasks.map((t) => (t.id === id ? { ...t, status } : t)) }))

  const setAssignee = (id: string, email: string | undefined) =>
    update((d) => ({ ...d, tasks: d.tasks.map((t) => (t.id === id ? { ...t, assignee: email } : t)) }))

  const onDelete = (id: string) => update((d) => ({ ...d, tasks: d.tasks.filter((t) => t.id !== id) }))

  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">My Tasks</h1>
        <Button className="bg-sky-600 text-white hover:bg-sky-700" onClick={() => router.push("/staff/tasks/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-sm dark:bg-white/10 dark:border-white/20">
        <CardHeader>
          <CardTitle className="text-foreground">Tasks (assigned to you)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {myTasks.length === 0 ? (
            <div className="text-muted-foreground">No tasks yet.</div>
          ) : (
            myTasks.map((t) => {
              const assigneeEmail = t.assignee ?? "unassigned"
              return (
                <div
                  key={t.id}
                  className="flex flex-col gap-2 rounded-md border border-white/20 bg-white/10 backdrop-blur-md p-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/20 dark:bg-white/10"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium text-foreground">{t.title}</div>
                    <div className="text-xs text-muted-foreground">
                      Priority: {t.priority}
                      {t.dueDate ? ` • Due: ${new Date(t.dueDate).toLocaleDateString()}` : ""}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Reassign to another staff */}
                    <Select
                      value={assigneeEmail}
                      onValueChange={(v) => setAssignee(t.id, v === "unassigned" ? undefined : v)}
                    >
                      <SelectTrigger className="h-8 w-[200px] border-sky-200 dark:border-slate-700">
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
                      <SelectTrigger className="h-8 w-[140px] border-sky-200 dark:border-slate-700">
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
                      className="h-8 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30 bg-transparent"
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
