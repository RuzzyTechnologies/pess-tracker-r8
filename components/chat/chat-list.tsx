"use client"

import * as React from "react"
import { useData, getCurrentUser, type ChatThread, type ChatMessage, type User } from "@/lib/data"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Plus, MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"

type ThreadWithMeta = ChatThread & {
  otherUsers: User[]
  last?: ChatMessage
  unread: number
}

export function ChatList({
  onSelect,
  selectedId,
  showNew = true,
}: {
  onSelect?: (threadId: string) => void
  selectedId?: string
  showNew?: boolean
}) {
  const [state] = useData((d) => ({ chats: d.chats, messages: d.chatMessages, users: d.users }))
  const me = getCurrentUser()
  const [q, setQ] = React.useState("")
  const router = useRouter()

  const threads: ThreadWithMeta[] = React.useMemo(() => {
    if (!me) return []
    const list = state.chats
      .map((t) => {
        const last = [...state.messages]
          .filter((m) => m.threadId === t.id)
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
          .at(-1)
        const others = t.participantIds
          .filter((id) => id !== me.id)
          .map((id) => state.users.find((u) => u.id === id))
          .filter(Boolean) as User[]
        const unread = state.messages.filter(
          (m) => m.threadId === t.id && m.senderId !== me.id && !m.readBy.includes(me.id),
        ).length
        return { ...t, last, otherUsers: others, unread }
      })
      .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt))

    const term = q.trim().toLowerCase()
    return term
      ? list.filter(
          (t) =>
            t.otherUsers.some((u) => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)) ||
            (t.last?.text || "").toLowerCase().includes(term),
        )
      : list
  }, [state, q, me])

  return (
    <div className="flex h-full flex-col">
      <div className="p-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search people or messages..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-10"
          />
          {showNew && (
            <Button
              size="icon"
              className="h-10 w-10 shrink-0"
              onClick={() => router.push("/chat/new")}
              aria-label="New chat"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-4 pt-0">
          {threads.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No chats yet. Click + to start a conversation.
            </div>
          ) : (
            threads.map((t) => {
              const name = t.otherUsers.map((u) => u.name || u.email).join(", ") || "You"
              const preview = t.last?.text || "No messages yet"
              const time = new Date(t.last?.createdAt || t.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
              const active = selectedId === t.id
              return (
                <button
                  key={t.id}
                  className={[
                    "w-full rounded-lg p-3 text-left transition-colors",
                    active ? "bg-sky-100 dark:bg-sky-900/20" : "hover:bg-slate-100 dark:hover:bg-slate-800",
                  ].join(" ")}
                  onClick={() => (onSelect ? onSelect(t.id) : router.push(`/chat/${t.id}`))}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white">
                      <MessageCircle className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-medium text-slate-900 dark:text-slate-100">{name}</span>
                        <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">{time}</span>
                      </div>
                      <p className="mt-1 truncate text-sm text-slate-600 dark:text-slate-300">{preview}</p>
                    </div>
                    {t.unread > 0 && (
                      <span className="ml-2 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-sky-500 px-1.5 text-xs font-medium text-white">
                        {t.unread}
                      </span>
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
