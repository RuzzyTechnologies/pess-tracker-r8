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
      <div className="grid h-full grid-cols-[380px_1fr] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div className="border-r border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 p-4 dark:border-slate-800">
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Messages</h1>
          </div>
          <ChatList
            selectedId={active}
            onSelect={(id) => {
              setActive(id)
              router.push(`/chat/${id}`)
            }}
          />
        </div>
        <div className="bg-white dark:bg-slate-900">
          {active ? (
            <ChatThread threadId={active} />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">Select a chat to start messaging.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
