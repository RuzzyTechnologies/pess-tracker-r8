"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"

const BellIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
)

const PlusIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

export function TopNav({
  onNewProject,
  onNewTask,
}: {
  onNewProject?: () => void
  onNewTask?: () => void
} = {}) {
  const router = useRouter()
  const pathname = usePathname()

  const handleNewTask = () => {
    if (onNewTask) {
      onNewTask()
      return
    }

    if (pathname?.startsWith("/admin")) {
      router.push("/admin/tasks/new")
    } else if (pathname?.startsWith("/staff")) {
      router.push("/staff/tasks/new")
    } else {
      router.push("/tasks/new")
    }
  }

  const handleNotifications = () => {
    if (pathname?.startsWith("/admin")) {
      router.push("/admin/notifications")
    } else if (pathname?.startsWith("/staff")) {
      router.push("/staff/notifications")
    } else {
      router.push("/notifications")
    }
  }

  return (
    <div className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-border bg-background/60 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
        <div className="hidden md:block">
          <Input placeholder="Search projects, tasks..." className="w-[280px]" />
        </div>
        <Button variant="outline" onClick={handleNewTask} className="text-nowrap bg-transparent">
          <PlusIcon />
          <span className="ml-2">New Task</span>
        </Button>
        <ThemeToggle />
        <Button variant="ghost" size="icon" aria-label="Notifications" onClick={handleNotifications}>
          <BellIcon />
        </Button>
      </div>
    </div>
  )
}
