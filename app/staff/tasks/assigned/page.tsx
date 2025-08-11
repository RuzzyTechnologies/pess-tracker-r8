import DashboardShell from "@/components/dashboard-shell"
import StaffAssignedByMeView from "@/components/views/staff-assigned-by-me-view"

export default async function StaffAssignedByMePage() {
  return (
    <DashboardShell disallowAdmin>
      <StaffAssignedByMeView />
    </DashboardShell>
  )
}
