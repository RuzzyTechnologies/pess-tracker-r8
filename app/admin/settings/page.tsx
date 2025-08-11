import DashboardShell from "@/components/dashboard-shell"
import AdminSettingsView from "@/components/views/admin-settings-view"

export default async function AdminSettingsPage() {
  return (
    <DashboardShell requireAdmin>
      <AdminSettingsView />
    </DashboardShell>
  )
}
