"use client"

import * as React from "react"
import { useData, getCurrentUser, type ChatThread, type ChatMessage, type User } from "@/lib/data"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

const PlusIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const MessageCircleIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
)

const UsersIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
    />
  </svg>
)

const BuildingIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
    />
  </svg>
)

type ThreadWithMeta = ChatThread & {
  otherUsers: User[]
  last?: ChatMessage
  unread: number
  chatType: "individual" | "group" | "department"
  department?: string
  participantCount: number
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
  const [filter, setFilter] = React.useState<"all" | "individual" | "group" | "department">("all")
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

        const participantCount = t.participantIds.length
        let chatType: "individual" | "group" | "department" = "individual"
        let department: string | undefined

        if (participantCount > 2) {
          // Check if it's a department chat based on thread name or participant emails
          const isDepartmentChat =
            t.name?.toLowerCase().includes("department") ||
            t.name?.toLowerCase().includes("team") ||
            others.some((u) => u.email.includes("admin") || u.email.includes("manager"))

          if (isDepartmentChat) {
            chatType = "department"
            department = t.name || "Department Chat"
          } else {
            chatType = "group"
          }
        }

        return {
          ...t,
          last,
          otherUsers: others,
          unread,
          chatType,
          department,
          participantCount,
        }
      })
      .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt))

    const term = q.trim().toLowerCase()
    let filtered = term
      ? list.filter(
          (t) =>
            t.otherUsers.some((u) => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)) ||
            (t.last?.text || "").toLowerCase().includes(term) ||
            (t.department || "").toLowerCase().includes(term),
        )
      : list

    if (filter !== "all") {
      filtered = filtered.filter((t) => t.chatType === filter)
    }

    return filtered
  }, [state, q, me, filter])

  const getChatIcon = (thread: ThreadWithMeta) => {
    switch (thread.chatType) {
      case "department":
        return <BuildingIcon />
      case "group":
        return <UsersIcon />
      default:
        return <MessageCircleIcon />
    }
  }

  const getChatName = (thread: ThreadWithMeta) => {
    if (thread.chatType === "department" && thread.department) {
      return thread.department
    }
    if (thread.chatType === "group" && thread.name) {
      return thread.name
    }
    return thread.otherUsers.map((u) => u.name || u.email).join(", ") || "You"
  }

  return (
    <div className="flex h-full max-h-screen flex-col overflow-hidden">
      <div className="shrink-0 p-4 space-y-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search people or messages..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-10 bg-white/10 backdrop-blur-md border-white/20"
          />
          {showNew && (
            <Button
              size="icon"
              className="h-10 w-10 shrink-0 bg-primary hover:bg-primary/90"
              onClick={() => router.push("/chat/new")}
              aria-label="New chat"
            >
              <PlusIcon />
            </Button>
          )}
        </div>

        <div className="flex gap-1 p-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
          {[
            { key: "all", label: "All" },
            { key: "individual", label: "Direct" },
            { key: "group", label: "Groups" },
            { key: "department", label: "Departments" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filter === key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-2 p-4">
            {threads.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                {filter === "all" ? "No chats yet. Click + to start a conversation." : `No ${filter} chats found.`}
              </div>
            ) : (
              threads.map((t) => {
                const name = getChatName(t)
                const preview = t.last?.text || "No messages yet"
                const time = new Date(t.last?.createdAt || t.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
                const active = selectedId === t.id
                return (
                  <button
                    key={t.id}
                    className={`w-full rounded-lg p-3 text-left transition-colors bg-white/10 backdrop-blur-md border border-white/20 ${
                      active ? "bg-accent border-primary/50" : "hover:bg-white/20"
                    }`}
                    onClick={() => (onSelect ? onSelect(t.id) : router.push(`/chat/${t.id}`))}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                          t.chatType === "department"
                            ? "bg-orange-500"
                            : t.chatType === "group"
                              ? "bg-green-500"
                              : "bg-primary"
                        } text-white`}
                      >
                        {getChatIcon(t)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="truncate font-medium text-foreground">{name}</span>
                            {t.chatType !== "individual" && (
                              <span className="shrink-0 text-xs text-muted-foreground bg-white/20 px-1.5 py-0.5 rounded">
                                {t.participantCount}
                              </span>
                            )}
                          </div>
                          <span className="shrink-0 text-xs text-muted-foreground">{time}</span>
                        </div>
                        <p className="mt-1 truncate text-sm text-muted-foreground">{preview}</p>
                        {t.chatType !== "individual" && (
                          <p className="mt-1 text-xs text-muted-foreground capitalize">{t.chatType} chat</p>
                        )}
                      </div>
                      {t.unread > 0 && (
                        <span className="ml-2 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
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
    </div>
  )
}
