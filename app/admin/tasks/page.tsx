import DashboardShell from "@/components/dashboard-shell"
import AdminTasksView from "@/components/views/admin-tasks-view"

export default async function AdminTasksPage() {
  return (
    <DashboardShell requireAdmin>
      <AdminTasksView />
    </DashboardShell>
  )
}
