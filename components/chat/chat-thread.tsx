"use client"

import * as React from "react"
import { useData, DataAPI, getCurrentUser, listenTyping, setTyping, type User } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter } from "next/navigation"

const ArrowLeft = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 12H5m7-7l-7 7 7 7-7-7 7-7" />
  </svg>
)

const Send = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
)

const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
    />
  </svg>
)

const BuildingIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
    />
  </svg>
)

export function ChatThread({ threadId }: { threadId: string }) {
  const [state, update] = useData((d) => ({
    messages: d.chatMessages.filter((m) => m.threadId === threadId),
    users: d.users,
    threads: d.chats,
  }))
  const me = getCurrentUser()!
  const thread = state.threads.find((t) => t.id === threadId)
  const others = (thread?.participantIds || [])
    .filter((id) => id !== me.id)
    .map((id) => state.users.find((u) => u.id === id))
  const otherUsers = (others || []).filter(Boolean) as User[]

  const [input, setInput] = React.useState("")
  const [typingFrom, setTypingFrom] = React.useState<string | null>(null)
  const viewportRef = React.useRef<HTMLDivElement | null>(null)
  const router = useRouter()

  React.useEffect(() => {
    const v = viewportRef.current
    if (!v) return
    requestAnimationFrame(() => {
      v.scrollTop = v.scrollHeight
    })
  }, [state.messages.length])

  React.useEffect(() => {
    DataAPI.chat.markRead(threadId, me.id)
    update((d) => d)
  }, [threadId])

  React.useEffect(() => {
    return listenTyping(threadId, (userId) => {
      if (userId === me.id) return
      setTypingFrom(userId)
      const t = setTimeout(() => setTypingFrom(null), 1200)
      return () => clearTimeout(t)
    })
  }, [threadId])

  const onSend = () => {
    if (!input.trim()) return
    DataAPI.chat.sendMessage(threadId, me.id, input)
    setInput("")
    update((d) => d)
  }

  const getChatName = () => {
    if (thread?.name) {
      return thread.name
    }
    if (thread?.chatType === "group" && otherUsers.length > 1) {
      return `Group Chat (${thread.participantIds.length})`
    }
    if (thread?.chatType === "department") {
      return "Department Chat"
    }
    return otherUsers.map((u) => u.name || u.email).join(", ") || "You"
  }

  const getChatIcon = () => {
    if (thread?.chatType === "department") {
      return <BuildingIcon className="h-4 w-4" />
    }
    if (thread?.chatType === "group" || (thread?.participantIds.length || 0) > 2) {
      return <UsersIcon className="h-4 w-4" />
    }
    return null
  }

  const getChatSubtitle = () => {
    if (typingFrom) {
      const typingUser = state.users.find((u) => u.id === typingFrom)
      return `${typingUser?.name || "Someone"} is typing...`
    }

    if (thread?.chatType === "department") {
      return `${thread.participantIds.length} members`
    }
    if (thread?.chatType === "group") {
      return `${thread.participantIds.length} participants`
    }
    if (otherUsers.length > 1) {
      return `${otherUsers.map((u) => u.name || u.email).join(", ")}`
    }
    return "tap to chat"
  }

  const name = getChatName()
  const chatIcon = getChatIcon()

  return (
    <div className="flex h-full flex-col min-h-0 max-h-full">
      <div className="flex h-12 items-center gap-2 border-b border-border bg-card px-3 flex-shrink-0">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => router.push("/chat")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${
              thread?.chatType === "department"
                ? "bg-orange-500"
                : thread?.chatType === "group"
                  ? "bg-green-500"
                  : "bg-primary"
            }`}
          >
            {chatIcon || name.slice(0, 1)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-foreground">{name}</div>
            <div className="text-[10px] text-muted-foreground truncate">{getChatSubtitle()}</div>
          </div>
          {(thread?.participantIds.length || 0) > 2 && (
            <div className="shrink-0 text-xs text-muted-foreground bg-white/20 px-2 py-1 rounded-full">
              {thread?.participantIds.length}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div ref={viewportRef} className="mx-auto w-full max-w-3xl space-y-2 p-3 min-h-full">
            {state.messages.map((m) => {
              const mine = m.senderId === me.id
              const sender = mine ? me : state.users.find((u) => u.id === m.senderId)
              const time = new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              const read = otherUsers.every((u) => m.readBy.includes(u.id))
              const showSenderName = !mine && (thread?.participantIds.length || 0) > 2

              return (
                <div key={m.id} className={["flex w-full", mine ? "justify-end" : "justify-start"].join(" ")}>
                  <div
                    className={[
                      "max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow",
                      mine
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-card border border-border rounded-bl-sm",
                    ].join(" ")}
                  >
                    {showSenderName && (
                      <div className="mb-0.5 text-[10px] font-medium text-muted-foreground">
                        {sender?.name || sender?.email || "User"}
                      </div>
                    )}
                    <div className="whitespace-pre-wrap break-words">{m.text}</div>
                    <div
                      className={[
                        "mt-1 text-[10px]",
                        mine ? "text-primary-foreground/80" : "text-muted-foreground",
                      ].join(" ")}
                    >
                      {time} {mine ? (read ? "• Read" : "• Sent") : ""}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </div>

      <div className="flex items-center gap-2 border-t border-border bg-card p-2 flex-shrink-0">
        <Input
          placeholder={`Message ${thread?.chatType === "department" ? "department" : thread?.chatType === "group" ? "group" : name}`}
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setTyping(threadId, me.id)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              onSend()
            }
          }}
          className="h-10 flex-1"
        />
        <Button onClick={onSend} className="h-10">
          <Send className="mr-1 h-4 w-4" /> Send
        </Button>
      </div>
    </div>
  )
}
