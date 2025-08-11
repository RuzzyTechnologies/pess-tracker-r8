import DashboardShell from "@/components/dashboard-shell"
import NewChatInner from "@/components/chat/new-chat-inner"

export default async function NewChatPage() {
  return (
    <DashboardShell>
      <NewChatInner />
    </DashboardShell>
  )
}
