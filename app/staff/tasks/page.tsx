import DashboardShell from "@/components/dashboard-shell"
import StaffTasksView from "@/components/views/staff-tasks-view"

export default async function StaffTasksPage() {
  // Disallow admins; send them to /admin
  return (
    <DashboardShell disallowAdmin>
      <StaffTasksView />
    </DashboardShell>
  )
}
