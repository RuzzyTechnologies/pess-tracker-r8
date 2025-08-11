import DashboardShell from "@/components/dashboard-shell"
import ProjectsView from "@/components/views/projects-view"

export default async function ProjectsPage() {
  return (
    <DashboardShell>
      <ProjectsView />
    </DashboardShell>
  )
}
