"use client"

import * as React from "react"
import { useData, DataAPI, getCurrentUser, listenTyping, setTyping, type User } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter } from "next/navigation"
import { isAdminEmail } from "@/lib/auth"

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

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
)

const MoreDotsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
    />
  </svg>
)

const UserMinusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"
    />
  </svg>
)

const ShieldIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
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
  const [showAdminMenu, setShowAdminMenu] = React.useState(false)
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null)
  const [showUserRemoval, setShowUserRemoval] = React.useState(false)
  const [moderationReason, setModerationReason] = React.useState("")
  const [showModerationDialog, setShowModerationDialog] = React.useState<string | null>(null)
  const viewportRef = React.useRef<HTMLDivElement | null>(null)
  const router = useRouter()

  const isAdmin = isAdminEmail(me.email)

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

  const deleteMessage = (messageId: string) => {
    DataAPI.chat.deleteMessage(messageId)
    setDeleteConfirm(null)
    update((d) => d)
  }

  const deleteMessageForModeration = (messageId: string, reason: string) => {
    DataAPI.chat.deleteMessage(messageId)
    setShowModerationDialog(null)
    setModerationReason("")
    update((d) => d)
    console.log(`[Admin] Deleted message ${messageId} for: ${reason}`)
  }

  const deleteThread = () => {
    if (
      window.confirm(
        `Are you sure you want to delete this ${thread?.chatType || "chat"}? This action cannot be undone.`,
      )
    ) {
      DataAPI.chat.deleteThread(threadId)
      router.push("/chat")
    }
  }

  const removeUserFromChat = (userId: string) => {
    if (
      window.confirm(
        `Are you sure you want to remove this user from the ${thread?.chatType || "chat"}? They will no longer be able to see new messages.`,
      )
    ) {
      DataAPI.chat.removeParticipant(threadId, userId)
      setShowUserRemoval(false)
      update((d) => d)
    }
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
        {isAdmin && (
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAdminMenu(!showAdminMenu)}
              className="text-muted-foreground hover:text-foreground"
            >
              <MoreDotsIcon className="h-4 w-4" />
            </Button>
            {showAdminMenu && (
              <div className="absolute right-0 top-full mt-1 w-56 rounded-md border border-border bg-card shadow-lg z-50">
                <div className="p-1">
                  {(thread?.chatType === "group" || thread?.chatType === "department") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowUserRemoval(!showUserRemoval)
                        setShowAdminMenu(false)
                      }}
                      className="w-full justify-start text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950"
                    >
                      <UserMinusIcon className="mr-2 h-4 w-4" />
                      Remove User
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={deleteThread}
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <TrashIcon className="mr-2 h-4 w-4" />
                    Delete{" "}
                    {thread?.chatType === "department" ? "Department" : thread?.chatType === "group" ? "Group" : "Chat"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {isAdmin && showUserRemoval && (thread?.chatType === "group" || thread?.chatType === "department") && (
        <div className="border-b border-border bg-card p-3">
          <div className="flex items-center gap-2 mb-2">
            <ShieldIcon className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium text-foreground">
              Remove User from {thread.chatType === "department" ? "Department" : "Group"}
            </span>
          </div>
          <div className="space-y-2">
            {otherUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-2 rounded-md bg-white/10 backdrop-blur-md border border-white/20"
              >
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    {user.name?.slice(0, 1) || user.email.slice(0, 1)}
                  </div>
                  <span className="text-sm text-foreground">{user.name || user.email}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeUserFromChat(user.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowUserRemoval(false)}
            className="mt-2 text-muted-foreground"
          >
            Cancel
          </Button>
        </div>
      )}

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
                  <div className="flex items-start gap-2 max-w-[85%]">
                    <div
                      className={[
                        "rounded-2xl px-3 py-2 text-sm shadow",
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
                    {isAdmin && (
                      <div className="flex flex-col gap-1 mt-1">
                        {showModerationDialog === m.id ? (
                          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-md p-2 w-48">
                            <div className="text-xs text-foreground mb-2 flex items-center gap-1">
                              <ShieldIcon className="h-3 w-3" />
                              Content Moderation
                            </div>
                            <select
                              value={moderationReason}
                              onChange={(e) => setModerationReason(e.target.value)}
                              className="w-full text-xs p-1 rounded border bg-white/20 text-foreground mb-2"
                            >
                              <option value="">Select reason...</option>
                              <option value="inappropriate">Inappropriate content</option>
                              <option value="violent">Violent language</option>
                              <option value="harassment">Harassment</option>
                              <option value="spam">Spam</option>
                              <option value="other">Other violation</option>
                            </select>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => moderationReason && deleteMessageForModeration(m.id, moderationReason)}
                                disabled={!moderationReason}
                                className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                              >
                                ✓
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setShowModerationDialog(null)
                                  setModerationReason("")
                                }}
                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                              >
                                ✕
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowModerationDialog(m.id)}
                            className="h-6 w-6 text-muted-foreground hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Moderate content"
                          >
                            <ShieldIcon className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}
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
