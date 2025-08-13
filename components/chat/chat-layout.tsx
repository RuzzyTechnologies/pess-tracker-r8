"use client"

import * as React from "react"
import { ChatList } from "./chat-list"
import { ChatThread } from "./chat-thread"
import { useRouter } from "next/navigation"

export default function ChatLayout({ threadId }: { threadId?: string }) {
  const [active, setActive] = React.useState<string | undefined>(threadId)
  const router = useRouter()

  React.useEffect(() => setActive(threadId), [threadId])

  return (
    <div className="mx-auto h-[calc(100svh-8rem)] w-full max-w-7xl p-6">
      <div className="grid h-full grid-cols-[380px_1fr] overflow-hidden rounded-xl border border-border bg-card shadow-lg">
        <div className="border-r border-border bg-muted">
          <div className="border-b border-border p-4">
            <h1 className="text-lg font-semibold text-foreground">Messages</h1>
          </div>
          <ChatList
            selectedId={active}
            onSelect={(id) => {
              setActive(id)
              router.push(`/chat/${id}`)
            }}
          />
        </div>
        <div className="bg-card">
          {active ? (
            <ChatThread threadId={active} />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">Select a chat to start messaging.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
