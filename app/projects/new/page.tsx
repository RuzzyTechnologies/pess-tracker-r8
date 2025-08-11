import DashboardShell from "@/components/dashboard-shell"
import ProjectNewView from "@/components/views/project-new-view"

export default async function ProjectNewPage() {
  return (
    <DashboardShell>
      <ProjectNewView />
    </DashboardShell>
  )
}
