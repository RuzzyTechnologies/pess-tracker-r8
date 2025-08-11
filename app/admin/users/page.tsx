import DashboardShell from "@/components/dashboard-shell"
import AdminUsersView from "@/components/views/admin-users-view"

export default async function AdminUsersPage() {
  return (
    <DashboardShell requireAdmin>
      <AdminUsersView />
    </DashboardShell>
  )
}
