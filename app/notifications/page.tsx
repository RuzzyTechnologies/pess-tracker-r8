import DashboardShell from "@/components/dashboard-shell"
import NotificationsView from "@/components/views/notifications-view"

export default async function NotificationsPage() {
  return (
    <DashboardShell>
      <NotificationsView />
    </DashboardShell>
  )
}
