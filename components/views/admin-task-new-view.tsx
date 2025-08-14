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
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
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
              <Select value={status} onValueChange={(v) => setStatus(v as any)}>
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
              <Select value={projectId} onValueChange={(v) => setProjectId(v)}>
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
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Assign to staff</Label>
            <Select value={assignee} onValueChange={(v) => setAssignee(v)}>
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

          <div className="flex items-center gap-2">
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                if (!title.trim()) return
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
              }}
            >
              Create Task
            </Button>
            <Button
              variant="outline"
              className="border-white/20 dark:border-slate-700/30 bg-transparent backdrop-blur-sm"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
