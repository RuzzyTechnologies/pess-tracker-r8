import DashboardShell from "@/components/dashboard-shell"
import TimeView from "@/components/views/time-view"

export default async function StaffTimePage() {
  return (
    <DashboardShell disallowAdmin>
      <TimeView />
    </DashboardShell>
  )
}
