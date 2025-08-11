import DashboardShell from "@/components/dashboard-shell"
import NotificationsView from "@/components/views/notifications-view"

export default async function StaffNotificationsPage() {
  return (
    <DashboardShell disallowAdmin>
      <NotificationsView />
    </DashboardShell>
  )
}
