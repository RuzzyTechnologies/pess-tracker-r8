"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useData, DataAPI, getCurrentUser, type User } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminTaskNewView() {
  const router = useRouter()
  const me = getCurrentUser()
  const [state] = useData((d) => ({ projects: d.projects, users: d.users }))
  const staff: User[] = React.useMemo(() => state.users.filter((u) => u.role === "staff"), [state.users])

  const [title, setTitle] = React.useState("")
  const [priority, setPriority] = React.useState<"Low" | "Medium" | "High">("Medium")
  const [status, setStatus] = React.useState<"Todo" | "In Progress" | "Done">("Todo")
  const [projectId, setProjectId] = React.useState<string | undefined>(state.projects[0]?.id)
  const [due, setDue] = React.useState<string>("")
  const [assignee, setAssignee] = React.useState<string>("unassigned")

  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string>("")

  const handleSubmit = async () => {
    if (isSubmitting) return

    // Validation
    if (!title.trim()) {
      setError("Task title is required")
      return
    }

    if (title.trim().length < 3) {
      setError("Task title must be at least 3 characters long")
      return
    }

    setError("")
    setIsSubmitting(true)

    try {
      DataAPI.addTask({
        title: title.trim(),
        priority,
        status,
        projectId,
        dueDate: due ? new Date(due).toISOString() : undefined,
        assignee: assignee === "unassigned" ? undefined : assignee,
        createdById: me?.id,
      })
      router.push("/admin/tasks")
    } catch (err) {
      setError("Failed to create task. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-4 md:p-6">
      <Card className="backdrop-blur-lg supports-[backdrop-filter]:bg-white/10 border border-white/20 shadow-lg dark:supports-[backdrop-filter]:bg-slate-900/10 dark:border-slate-700/30">
        <CardHeader>
          <CardTitle className="text-foreground">New Task (Admin)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-white/20 dark:border-slate-700/30 bg-white/10 dark:bg-slate-900/10"
              placeholder="Prepare onboarding checklist"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as any)} disabled={isSubmitting}>
                <SelectTrigger className="border-white/20 dark:border-slate-700/30 bg-white/10 dark:bg-slate-900/10">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as any)} disabled={isSubmitting}>
                <SelectTrigger className="border-white/20 dark:border-slate-700/30 bg-white/10 dark:bg-slate-900/10">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todo">Todo</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Project</Label>
              <Select value={projectId} onValueChange={(v) => setProjectId(v)} disabled={isSubmitting}>
                <SelectTrigger className="border-white/20 dark:border-slate-700/30 bg-white/10 dark:bg-slate-900/10">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {state.projects.map((p) => (
                    <SelectItem value={p.id} key={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="due">Due date</Label>
              <Input
                id="due"
                type="date"
                value={due}
                onChange={(e) => setDue(e.target.value)}
                className="border-white/20 dark:border-slate-700/30 bg-white/10 dark:bg-slate-900/10"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Assign to staff</Label>
            <Select value={assignee} onValueChange={(v) => setAssignee(v)} disabled={isSubmitting}>
              <SelectTrigger className="border-white/20 dark:border-slate-700/30 bg-white/10 dark:bg-slate-900/10">
                <SelectValue placeholder="Select staff" />
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
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
            <Button
              variant="outline"
              className="border-white/20 dark:border-slate-700/30 bg-transparent backdrop-blur-sm"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
