"use client"
import { useData, type Project } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ProjectsView() {
  const [projects, update] = useData((d) => d.projects)
  const router = useRouter()

  const onDelete = (id: string) =>
    update((d) => ({
      ...d,
      projects: d.projects.filter((p) => p.id !== id),
      tasks: d.tasks.filter((t) => t.projectId !== id),
    }))

  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-6 space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h1 className="text-xl font-semibold text-foreground">Projects</h1>
        <Button className="bg-sky-600 text-white hover:bg-sky-700" onClick={() => router.push("/projects/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <Card className="backdrop-blur supports-[backdrop-filter]:bg-white/75 border border-sky-100/70 shadow-sm dark:supports-[backdrop-filter]:bg-slate-900/70 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-foreground">All Projects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {projects.length === 0 ? (
            <div className="text-sm text-muted-foreground">No projects yet. Create your first project.</div>
          ) : (
            <ul className="space-y-3">
              {projects.map((p) => (
                <li
                  key={p.id}
                  className="rounded-md border border-sky-100/70 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-900/70"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="truncate font-medium text-foreground">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.description || "No description"}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        defaultValue={p.status}
                        onValueChange={(val) =>
                          update((d) => ({
                            ...d,
                            projects: d.projects.map((x) =>
                              x.id === p.id ? { ...x, status: val as Project["status"] } : x,
                            ),
                          }))
                        }
                      >
                        <SelectTrigger className="h-8 w-[140px] border-sky-200 dark:border-slate-700">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Planning">Planning</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Review">Review</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        className="h-8 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30 bg-transparent"
                        onClick={() => onDelete(p.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
