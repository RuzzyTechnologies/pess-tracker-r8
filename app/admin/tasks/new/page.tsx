import DashboardShell from "@/components/dashboard-shell"
import AdminTaskNewView from "@/components/views/admin-task-new-view"

export default async function AdminTaskNewPage() {
  return (
    <DashboardShell requireAdmin>
      <AdminTaskNewView />
    </DashboardShell>
  )
}
