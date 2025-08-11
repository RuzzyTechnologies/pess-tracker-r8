import DashboardShell from "@/components/dashboard-shell"
import NotificationsView from "@/components/views/notifications-view"

export default async function AdminNotificationsPage() {
  return (
    <DashboardShell requireAdmin>
      <NotificationsView />
    </DashboardShell>
  )
}
