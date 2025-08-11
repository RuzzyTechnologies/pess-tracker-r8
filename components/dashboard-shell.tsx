import type React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { SESSION_COOKIE, isAdminEmail } from "@/lib/auth"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { PresenceClient } from "@/components/presence-client"

function Background({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-1 flex-col overflow-hidden bg-gradient-to-b from-sky-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-12 -left-12 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute top-1/3 -right-16 h-72 w-72 rounded-full bg-sky-100/60 blur-3xl" />
        <div className="absolute bottom-[-6rem] left-1/4 h-96 w-96 rounded-full bg-sky-300/20 blur-3xl" />
      </div>
      {children}
    </div>
  )
}

export default async function DashboardShell({
  children,
  requireAdmin = false,
  disallowAdmin = false,
}: {
  children: React.ReactNode
  requireAdmin?: boolean
  disallowAdmin?: boolean
}) {
  const cookieStore = cookies()
  const email = cookieStore.get(SESSION_COOKIE)?.value
  if (!email) redirect("/login")

  const admin = isAdminEmail(email)
  if (requireAdmin && !admin) redirect("/staff")
  if (disallowAdmin && admin) redirect("/admin")

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Background>
          {/* Presence heartbeat: marks users active while logged in */}
          <PresenceClient />
          <TopNav />
          <div className="flex-1 overflow-y-auto">{children}</div>
        </Background>
      </SidebarInset>
    </SidebarProvider>
  )
}
