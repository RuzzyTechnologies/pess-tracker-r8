import DashboardShell from "@/components/dashboard-shell"
import ChatLayout from "@/components/chat/chat-layout"

export default async function ChatPage() {
  return (
    <DashboardShell>
      <ChatLayout />
    </DashboardShell>
  )
}
