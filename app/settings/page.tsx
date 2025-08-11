import DashboardShell from "@/components/dashboard-shell"
import SettingsView from "@/components/views/settings-view"

export default async function SettingsPage() {
  return (
    <DashboardShell>
      <SettingsView />
    </DashboardShell>
  )
}
