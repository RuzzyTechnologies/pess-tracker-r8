"use client"

import { Bell, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"

export function TopNav({
  onNewProject,
  onNewTask,
}: {
  onNewProject?: () => void
  onNewTask?: () => void
} = {}) {
  const router = useRouter()

  return (
    <div className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-sky-100/70 bg-white/60 px-4 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
        <div className="hidden md:block">
          <Input
            placeholder="Search projects, tasks..."
            className="w-[280px] border-sky-100 focus-visible:ring-sky-400/40 dark:border-slate-800"
          />
        </div>
        <Button
          variant="outline"
          onClick={onNewTask}
          className="border-sky-200 text-sky-700 hover:bg-sky-50 text-nowrap dark:border-slate-700 dark:text-sky-300 dark:hover:bg-slate-800/60 bg-transparent"
        >
          <Plus className="mr-2 h-4 w-4" /> New Task
        </Button>
        <Button
          onClick={onNewProject}
          className="bg-sky-600 text-white hover:bg-sky-700 text-nowrap dark:bg-sky-600 dark:hover:bg-sky-500"
        >
          <Plus className="mr-2 h-4 w-4" /> New Project
        </Button>
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="text-slate-700 hover:text-sky-700 dark:text-slate-200 dark:hover:text-sky-300"
        >
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
