"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./components/app-sidebar"
import { TopNav } from "./components/top-nav"
import {
  Activity,
  CalendarClock,
  CheckCircle2,
  Users,
  ShieldCheck,
  Timer,
  Plus,
  UserPlus,
  Check,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"

function Background({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-1 flex-col overflow-hidden bg-gradient-to-b from-background to-muted">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-12 -left-12 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-1/3 -right-16 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-6rem] left-1/4 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
      </div>
      {children}
    </div>
  )
}

function SurfaceCard(props: React.ComponentProps<typeof Card>) {
  return (
    <Card
      {...props}
      className={[
        /* Enhanced glassmorphism effects with more transparency and stronger blur */
        "backdrop-blur-lg supports-[backdrop-filter]:bg-card/10",
        "border border-white/20 shadow-lg dark:border-slate-700/30",
        "transition-all hover:shadow-xl hover:-translate-y-[1px] active:translate-y-0",
        "hover:bg-card/20 dark:hover:bg-card/15",
        props.className,
      ].join(" ")}
    />
  )
}

function SectionBanner({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
}) {
  return (
    <SurfaceCard>
      <div className="flex items-center gap-3 p-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>
        <div className="flex flex-col">
          <div className="text-sm font-semibold text-foreground">{title}</div>
          <div className="text-xs text-muted-foreground">{subtitle}</div>
        </div>
      </div>
    </SurfaceCard>
  )
}

function Kpi({
  title,
  value,
  icon,
  hint,
}: {
  title: string
  value: string
  icon?: React.ReactNode
  hint?: string
}) {
  return (
    <SurfaceCard>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-medium text-muted-foreground dark:text-white">{title}</CardTitle>
          <div className="text-primary">{icon}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight text-foreground dark:text-white">{value}</div>
        {hint ? <div className="mt-1 text-xs text-muted-foreground dark:text-slate-200">{hint}</div> : null}
      </CardContent>
    </SurfaceCard>
  )
}

function Pill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={[
        /* Updated to use semantic colors */
        "inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary ring-1 ring-primary/20",
        className,
      ].join(" ")}
    >
      {children}
    </span>
  )
}

function QuickActionsCard({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode
  title: string
  subtitle?: string
}) {
  return (
    <SurfaceCard>
      <div className="flex flex-col gap-2 p-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="text-sm font-medium text-foreground">{title}</div>
          {subtitle ? <div className="text-xs text-muted-foreground">{subtitle}</div> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      </div>
    </SurfaceCard>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2">
      <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-primary" />
      <Separator orientation="vertical" className="mr-2 h-4 bg-border" />
      <div className="text-sm font-medium text-muted-foreground">{title}</div>
    </div>
  )
}

function MainDashboard() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 p-4 md:p-6">
      <SectionHeader title="Overview" />
      <div className="grid min-w-0 gap-4 overflow-x-auto sm:grid-cols-2 lg:grid-cols-4">
        <Kpi title="Active Projects" value="8" icon={<Users className="h-4 w-4" />} hint="+2 this month" />
        <Kpi title="Tasks Due This Week" value="24" icon={<CalendarClock className="h-4 w-4" />} hint="5 today" />
        <Kpi title="Overdue Tasks" value="5" icon={<Activity className="h-4 w-4" />} hint="-2 vs last week" />
        <Kpi title="Completion Rate" value="76%" icon={<CheckCircle2 className="h-4 w-4" />} hint="30-day rolling" />
      </div>

      <div className="grid min-w-0 gap-4 overflow-x-auto sm:grid-cols-2 lg:grid-cols-3">
        <SurfaceCard className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-foreground">Activity Feed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md border border-white/20 bg-white/10 backdrop-blur-md p-3 text-sm text-foreground">
              New comment on Task #231
            </div>
            <div className="rounded-md border border-white/20 bg-white/10 backdrop-blur-md p-3 text-sm text-foreground">
              Project "Website Revamp" moved to In Progress
            </div>
            <div className="rounded-md border border-white/20 bg-white/10 backdrop-blur-md p-3 text-sm text-foreground">
              Alice logged 1h on "API Integration"
            </div>
          </CardContent>
        </SurfaceCard>

        <SurfaceCard>
          <CardHeader>
            <CardTitle className="text-foreground">Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-md bg-white/10 backdrop-blur-md border border-white/20 p-2">
              <span>Milestone: API v1 freeze</span>
              <span className="text-primary">Aug 18</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-white/10 backdrop-blur-md border border-white/20 p-2">
              <span>Task: QA Test Plan</span>
              <span className="text-primary">Aug 20</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-white/10 backdrop-blur-md border border-white/20 p-2">
              <span>Task: Final Copy Review</span>
              <span className="text-primary">Aug 22</span>
            </div>
          </CardContent>
        </SurfaceCard>
      </div>
    </div>
  )
}

function StaffDashboard() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 p-4 md:p-6">
      <SectionBanner
        icon={<Timer className="h-4 w-4" />}
        title="Staff Mode"
        subtitle="Your tasks, time, and personal focus"
      />
      <QuickActionsCard title="Quick actions" subtitle="Stay on track">
        <Button variant="outline" className="h-8 border-border text-primary hover:bg-muted bg-transparent">
          <Timer className="mr-2 h-4 w-4" /> Start focus timer
        </Button>
        <Button variant="outline" className="h-8 border-border text-primary hover:bg-muted bg-transparent">
          <Plus className="mr-2 h-4 w-4" /> New task
        </Button>
        <Button className="h-8 bg-primary text-primary-foreground hover:bg-primary/90">
          <Check className="mr-2 h-4 w-4" /> Log time
        </Button>
      </QuickActionsCard>

      <div className="grid min-w-0 gap-4 overflow-x-auto sm:grid-cols-2 lg:grid-cols-3">
        {/* My Tasks - span 2 columns on sm+ and lg */}
        <SurfaceCard className="sm:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-foreground">My Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex min-w-0 w-full items-center justify-between rounded-md border border-white/20 bg-white/10 backdrop-blur-md p-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                <span className="truncate">Implement "Upload files"</span>
                <Pill>High</Pill>
              </div>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">Due Aug 12</span>
            </div>
            <div className="flex min-w-0 w-full items-center justify-between rounded-md border border-white/20 bg-white/10 backdrop-blur-md p-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-2 w-2 rounded-full bg-primary/70" aria-hidden="true" />
                <span className="truncate">Fix timeline labels</span>
                <Pill className="bg-card/80 text-primary">Medium</Pill>
              </div>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">Due Aug 13</span>
            </div>
            <div className="flex min-w-0 w-full items-center justify-between rounded-md border border-white/20 bg-white/10 backdrop-blur-md p-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-2 w-2 rounded-full bg-primary/50" aria-hidden="true" />
                <span className="truncate">Write daily log</span>
                <Pill className="bg-card/80 text-primary">Today</Pill>
              </div>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">Today</span>
            </div>
          </CardContent>
        </SurfaceCard>

        {/* Time Tracker - 1 column */}
        <SurfaceCard>
          <CardHeader>
            <CardTitle className="text-foreground">Time Tracker</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span>Today</span>
              <span className="font-medium text-foreground">2h 15m</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div className="h-2 w-2/3 rounded-full bg-primary/70" />
            </div>
            <div className="flex items-center justify-between">
              <span>This Week</span>
              <span className="font-medium text-foreground">8h 40m</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div className="h-2 w-3/4 rounded-full bg-primary/60" />
            </div>
          </CardContent>
        </SurfaceCard>

        {/* My Projects - 1 column */}
        <SurfaceCard>
          <CardHeader>
            <CardTitle className="text-foreground">My Projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-md bg-white/10 backdrop-blur-md border border-white/20 p-2">
              <span>Website Revamp</span>
              <Pill>In Progress</Pill>
            </div>
            <div className="flex items-center justify-between rounded-md bg-white/10 backdrop-blur-md border border-white/20 p-2">
              <span>Grant 2025</span>
              <Pill>Planning</Pill>
            </div>
            <div className="flex items-center justify-between rounded-md bg-white/10 backdrop-blur-md border border-white/20 p-2">
              <span>Mobile MVP</span>
              <Pill>Review</Pill>
            </div>
          </CardContent>
        </SurfaceCard>

        {/* Notifications - span 2 columns on sm+ and lg */}
        <SurfaceCard className="sm:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-foreground">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-md border border-white/20 bg-white/10 backdrop-blur-md p-3">
              You were assigned to "API Integration"
            </div>
            <div className="rounded-md border border-white/20 bg-white/10 backdrop-blur-md p-3">
              New comment on "Design QA": please review icons
            </div>
            <div className="rounded-md border border-white/20 bg-white/10 backdrop-blur-md p-3">
              Reminder: Daily log due 5:00 PM
            </div>
          </CardContent>
        </SurfaceCard>
      </div>
    </div>
  )
}

function AdminDashboard() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 p-4 md:p-6">
      <SectionBanner
        icon={<ShieldCheck className="h-4 w-4" />}
        title="Admin Mode"
        subtitle="Organization-wide supervision, roles, and approvals"
      />
      <QuickActionsCard title="Admin actions" subtitle="Manage access and oversight">
        <Button className="h-8 bg-primary text-primary-foreground hover:bg-primary/90">
          <UserPlus className="mr-2 h-4 w-4" /> Invite user
        </Button>
        <Button variant="outline" className="h-8 border-border text-primary hover:bg-muted bg-transparent">
          <ShieldCheck className="mr-2 h-4 w-4" /> Review approvals
        </Button>
        <Button variant="outline" className="h-8 border-border text-primary hover:bg-muted bg-transparent">
          <Plus className="mr-2 h-4 w-4" /> New role
        </Button>
      </QuickActionsCard>

      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        {/* Approvals Queue */}
        <SurfaceCard>
          <CardHeader>
            <CardTitle className="text-foreground">Approvals Queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex flex-col gap-2 rounded-md bg-white/10 backdrop-blur-md border border-white/20 p-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="min-w-0 text-foreground">Project "Grant 2025"</span>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  variant="outline"
                  className="h-7 border-border px-2 text-xs text-primary hover:bg-muted bg-transparent"
                >
                  <Eye className="mr-1 h-3.5 w-3.5" /> Review
                </Button>
                <Button className="h-7 bg-primary px-2 text-xs text-primary-foreground hover:bg-primary/90">
                  <Check className="mr-1 h-3.5 w-3.5" /> Approve
                </Button>
              </div>
            </div>
            {/* Item 2 */}
            <div className="flex flex-col gap-2 rounded-md bg-white/10 backdrop-blur-md border border-white/20 p-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="min-w-0 text-foreground">Task "Budget Review"</span>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  variant="outline"
                  className="h-7 border-border px-2 text-xs text-primary hover:bg-muted bg-transparent"
                >
                  <Eye className="mr-1 h-3.5 w-3.5" /> Review
                </Button>
                <Button className="h-7 bg-primary px-2 text-xs text-primary-foreground hover:bg-primary/90">
                  <Check className="mr-1 h-3.5 w-3.5" /> Approve
                </Button>
              </div>
            </div>
            {/* Item 3 */}
            <div className="flex flex-col gap-2 rounded-md bg-white/10 backdrop-blur-md border border-white/20 p-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="min-w-0 text-foreground">Task "Privacy Policy"</span>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  variant="outline"
                  className="h-7 border-border px-2 text-xs text-primary hover:bg-muted bg-transparent"
                >
                  <Eye className="mr-1 h-3.5 w-3.5" /> Review
                </Button>
                <Button className="h-7 bg-primary px-2 text-xs text-primary-foreground hover:bg-primary/90">
                  <Check className="mr-1 h-3.5 w-3.5" /> Approve
                </Button>
              </div>
            </div>
          </CardContent>
        </SurfaceCard>

        {/* Access Controls */}
        <SurfaceCard>
          <CardHeader>
            <CardTitle className="text-foreground">Access Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span>Project creation</span>
              <span className="shrink-0 rounded-full bg-white/10 backdrop-blur-md px-2 py-0.5 text-xs text-foreground ring-1 ring-white/20">
                Admins, Managers
              </span>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span>Approve tasks</span>
              <span className="shrink-0 rounded-full bg-white/10 backdrop-blur-md px-2 py-0.5 text-xs text-foreground ring-1 ring-white/20">
                Admins
              </span>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span>Manage roles</span>
              <span className="shrink-0 rounded-full bg-white/10 backdrop-blur-md px-2 py-0.5 text-xs text-foreground ring-1 ring-white/20">
                Admins
              </span>
            </div>
          </CardContent>
        </SurfaceCard>
      </div>
    </div>
  )
}

export default function PessTracker() {
  const [section, setSection] = React.useState<"main" | "staff" | "admin">("main")

  React.useEffect(() => {
    const apply = () => {
      const path = typeof window !== "undefined" ? window.location.pathname : "/"
      if (path.startsWith("/admin")) {
        setSection("admin")
        return
      }
      if (path.startsWith("/staff")) {
        setSection("staff")
        return
      }
      const h = (typeof window !== "undefined" && window.location.hash) || ""
      if (h.startsWith("#admin")) setSection("admin")
      else if (h.startsWith("#staff")) setSection("staff")
      else setSection("main")
    }
    apply()
    window.addEventListener("hashchange", apply)
    return () => window.removeEventListener("hashchange", apply)
  }, [])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Background>
          <TopNav />
          <div className="flex-1 overflow-y-auto">
            {section === "admin" ? <AdminDashboard /> : section === "staff" ? <StaffDashboard /> : <MainDashboard />}
          </div>
        </Background>
      </SidebarInset>
    </SidebarProvider>
  )
}
