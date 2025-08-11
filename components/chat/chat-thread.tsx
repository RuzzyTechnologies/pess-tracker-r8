"use client"

import * as React from "react"
import { useData, DataAPI, getCurrentUser, listenTyping, setTyping, type User } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Send } from "lucide-react"
import { useRouter } from "next/navigation"

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

  const name = otherUsers.map((u) => u.name || u.email).join(", ") || "You"

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-12 items-center gap-2 border-b border-sky-100/70 bg-white/60 px-3 dark:border-slate-800 dark:bg-slate-900/60">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => router.push("/chat")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-600 text-white">
            {name.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{name}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">
              {typingFrom ? "typing…" : "tap to chat"}
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div ref={viewportRef} className="mx-auto w-full max-w-3xl space-y-2 p-3">
          {state.messages.map((m) => {
            const mine = m.senderId === me.id
            const sender = mine ? me : state.users.find((u) => u.id === m.senderId)
            const time = new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            const read = otherUsers.every((u) => m.readBy.includes(u.id))
            return (
              <div key={m.id} className={["flex w-full", mine ? "justify-end" : "justify-start"].join(" ")}>
                <div
                  className={[
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow",
                    mine
                      ? "bg-sky-600 text-white rounded-br-sm"
                      : "bg-white/85 ring-1 ring-sky-100 dark:bg-slate-900/70 dark:ring-slate-800 rounded-bl-sm",
                  ].join(" ")}
                >
                  {!mine && (
                    <div className="mb-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      {sender?.name || "User"}
                    </div>
                  )}
                  <div className="whitespace-pre-wrap break-words">{m.text}</div>
                  <div
                    className={["mt-1 text-[10px]", mine ? "text-white/80" : "text-slate-500 dark:text-slate-400"].join(
                      " ",
                    )}
                  >
                    {time} {mine ? (read ? "• Read" : "• Sent") : ""}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>

      <div className="flex items-center gap-2 border-t border-sky-100/70 bg-white/60 p-2 dark:border-slate-800 dark:bg-slate-900/60">
        <Input
          placeholder="Type a message"
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
          className="h-10 flex-1 border-sky-100 dark:border-slate-700"
        />
        <Button onClick={onSend} className="h-10 bg-sky-600 text-white hover:bg-sky-700">
          <Send className="mr-1 h-4 w-4" /> Send
        </Button>
      </div>
    </div>
  )
}
