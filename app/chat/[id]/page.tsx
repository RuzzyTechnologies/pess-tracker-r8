import DashboardShell from "@/components/dashboard-shell"
import ChatLayout from "@/components/chat/chat-layout"

export default async function ChatThreadPage({ params }: { params: { id: string } }) {
  return (
    <DashboardShell>
      <ChatLayout threadId={params.id} />
    </DashboardShell>
  )
}
