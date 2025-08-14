"use client"

import React from "react"

import type { ReactElement } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import {
  LayoutGrid,
  KanbanSquare,
  Bell,
  Layers,
  Timer,
  ShieldCheck,
  Users,
  Sparkles,
  Plus,
  Settings,
  LogOut,
  ChevronDown,
  Search,
  MessageCircle,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type Item = {
  title: string
  href: string
  icon: ReactElement
  badge?: string | number
  tooltip?: string
  isActive?: boolean
}

const mainItems: Item[] = [
  { title: "Dashboard", icon: <LayoutGrid />, href: "#", tooltip: "Overview", isActive: true },
  { title: "Projects", icon: <KanbanSquare />, href: "#projects", tooltip: "All projects", badge: 8 },
  { title: "Chat", icon: <MessageCircle />, href: "#chat", tooltip: "Direct messages" },
  { title: "Notifications", icon: <Bell />, href: "#notifications", tooltip: "Alerts & updates", badge: 3 },
]

const staffItems: Item[] = [
  { title: "My Tasks", icon: <Layers />, href: "#staff-tasks", tooltip: "Assigned tasks", badge: 12 },
  { title: "Assigned by Me", icon: <Users />, href: "#staff-assigned", tooltip: "Tasks you assigned" },
  { title: "Time Tracker", icon: <Timer />, href: "#staff-time", tooltip: "Track your time" },
]

const adminItems: Item[] = [
  { title: "Admin Dashboard", icon: <ShieldCheck />, href: "#admin", tooltip: "Admin overview" },
  { title: "Teams & Users", icon: <Users />, href: "#admin-users", tooltip: "Manage teams" },
  { title: "Tasks", icon: <Layers />, href: "#admin-tasks", tooltip: "Assign and manage tasks" },
]

const sampleProjects = [
  { name: "Website Revamp", href: "#projects", status: "In Progress" },
  { name: "Grant 2025", href: "#projects", status: "Planning" },
  { name: "Mobile MVP", href: "#projects", status: "Review" },
]

export function AppSidebar(props: any) {
  const pathname = usePathname()
  const inAdminArea = /^\/admin(\/|$)/.test(pathname ?? "")
  const inStaffArea = /^\/staff(\/|$)/.test(pathname ?? "")

  const isAdminUser = React.useMemo(() => {
    // Check if currently in admin area
    if (inAdminArea) return true

    // Check if user has admin access by looking at browser history or referrer
    if (typeof window !== "undefined") {
      // Check if user came from admin area
      if (document.referrer.includes("/admin")) return true

      // Check localStorage for admin session indicator
      const adminSession = localStorage.getItem("pess-admin-access")
      if (adminSession === "true") return true

      // Check if current session has accessed admin pages
      const hasAdminAccess = sessionStorage.getItem("admin-access")
      if (hasAdminAccess === "true") return true
    }

    return false
  }, [inAdminArea, pathname])

  React.useEffect(() => {
    if (typeof window !== "undefined" && inAdminArea) {
      localStorage.setItem("pess-admin-access", "true")
      sessionStorage.setItem("admin-access", "true")
    }
  }, [inAdminArea])

  const dashboardHref = isAdminUser ? "/admin" : inStaffArea ? "/staff" : "/"
  const router = useRouter()

  const filteredMainItems = isAdminUser || inStaffArea ? mainItems.filter((i) => i.title !== "Projects") : mainItems

  const resolveHref = (item: Item) => {
    if (item.title === "Dashboard") return dashboardHref
    if (item.title === "Notifications")
      return isAdminUser ? "/admin/notifications" : inStaffArea ? "/staff/notifications" : "/notifications"
    if (item.title === "Projects") return "/projects"
    if (item.title === "Chat") return "/chat"
    return item.href
  }

  return (
    <Sidebar
      variant="floating"
      collapsible="icon"
      className={[
        "backdrop-blur supports-[backdrop-filter]:bg-white/75 dark:supports-[backdrop-filter]:bg-slate-900/70",
        "border border-sky-100/70 dark:border-slate-800 shadow-sm",
        "bg-[radial-gradient(1200px_200px_at_0%_-10%,rgba(56,189,248,0.08),transparent_60%)]",
        "dark:bg-[radial-gradient(1200px_200px_at_0%_-10%,rgba(2,6,23,0.6),transparent_60%)]",
      ].join(" ")}
      {...props}
    >
      <SidebarHeader className="gap-2 px-2">
        <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sky-600 text-white shadow-sm">
            <span className="text-xs font-bold">P</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="group h-8 w-full justify-between px-2 text-sm text-slate-700 hover:bg-sky-50 dark:text-slate-200 dark:hover:bg-slate-800/60"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-sky-600" />
                  PESS Tracker
                </span>
                <ChevronDown className="h-4 w-4 text-slate-500 transition-transform group-data-[state=open]:rotate-180" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-(--radix-popper-anchor-width)">
              <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
              <DropdownMenuItem>Acme Inc</DropdownMenuItem>
              <DropdownMenuItem>NGO Collective</DropdownMenuItem>
              <DropdownMenuItem>Freelance Hub</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-sky-700">
                <Plus className="mr-2 h-4 w-4" />
                New workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="relative px-2">
          <SidebarInput
            placeholder="Search..."
            className="pl-8 h-8 bg-white/80 border-sky-100 focus-visible:ring-sky-400/40 dark:bg-slate-900/70 dark:border-slate-800 dark:placeholder:text-slate-500"
          />
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-500 dark:text-slate-400">Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMainItems.map((item) => {
                const href = resolveHref(item)
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.isActive} tooltip={item.tooltip}>
                      <Link href={href} className="dark:text-slate-200">
                        {item.icon}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.badge ? <SidebarMenuBadge>{String(item.badge)}</SidebarMenuBadge> : null}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!isAdminUser && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-slate-500 dark:text-slate-400">Staff</SidebarGroupLabel>
            <SidebarGroupAction title="Create task" className="hover:bg-sky-50 hover:text-sky-700">
              <Plus className="h-4 w-4" />
            </SidebarGroupAction>
            <SidebarGroupContent>
              <SidebarMenu>
                {staffItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.tooltip}>
                      <Link
                        href={
                          item.title === "My Tasks"
                            ? "/staff/tasks"
                            : item.title === "Assigned by Me"
                              ? "/staff/tasks/assigned"
                              : "/staff/time"
                        }
                        className="dark:text-slate-200"
                      >
                        {item.icon}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.badge ? <SidebarMenuBadge>{String(item.badge)}</SidebarMenuBadge> : null}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {isAdminUser && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel className="text-slate-500 dark:text-slate-400">Admin</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild tooltip={item.tooltip}>
                        <Link
                          href={
                            item.title === "Admin Dashboard"
                              ? "/admin"
                              : item.title === "Teams & Users"
                                ? "/admin/users"
                                : "/admin/tasks"
                          }
                          className="dark:text-slate-200"
                        >
                          {item.icon}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="gap-1">
        <div className="px-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild size="sm" tooltip="Settings">
                <Link
                  href={isAdminUser ? "/admin/settings" : inStaffArea ? "/staff/settings" : "/settings"}
                  className="dark:text-slate-200"
                >
                  <Settings />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
        <div className="px-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="group flex h-10 w-full items-center justify-start gap-2 rounded-md px-2 hover:bg-sky-50"
              >
                <Avatar className="h-6 w-6 ring-1 ring-sky-100">
                  <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User avatar" />
                  <AvatarFallback className="text-[10px]">JD</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col text-left leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate text-xs font-medium text-slate-900">Jane Doe</span>
                  <span className="truncate text-[10px] text-slate-500">jane@acme.org</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-(--radix-popper-anchor-width)" side="top" align="start">
              <DropdownMenuLabel>My account</DropdownMenuLabel>
              <DropdownMenuItem>
                <Users className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Preferences
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onSelect={async (e) => {
                  e.preventDefault()
                  try {
                    await fetch("/api/logout", { method: "POST" })
                  } catch {}
                  router.push("/login")
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
