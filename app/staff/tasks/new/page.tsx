import DashboardShell from "@/components/dashboard-shell"
import TaskNewView from "@/components/views/task-new-view"

export default async function TaskNewPage() {
  return (
    <DashboardShell disallowAdmin>
      <TaskNewView />
    </DashboardShell>
  )
}
