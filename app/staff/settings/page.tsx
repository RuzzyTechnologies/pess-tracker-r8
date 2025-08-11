import DashboardShell from "@/components/dashboard-shell"
import StaffSettingsView from "@/components/views/staff-settings-view"

export default async function StaffSettingsPage() {
  return (
    <DashboardShell disallowAdmin>
      <StaffSettingsView />
    </DashboardShell>
  )
}
