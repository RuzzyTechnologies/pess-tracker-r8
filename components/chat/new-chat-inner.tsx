"use client"

import * as React from "react"
import { useData, getCurrentUser, DataAPI, type User } from "@/lib/data"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

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

type ChatType = "individual" | "group" | "department"

export default function NewChatInner() {
  const [state] = useData((d) => ({ users: d.users }))
  const me = getCurrentUser()!
  const [q, setQ] = React.useState("")
  const [chatType, setChatType] = React.useState<ChatType>("individual")
  const [selectedUsers, setSelectedUsers] = React.useState<User[]>([])
  const [groupName, setGroupName] = React.useState("")
  const [departmentName, setDepartmentName] = React.useState("")
  const router = useRouter()

  const list = React.useMemo(
    () =>
      state.users.filter(
        (u) =>
          u.id !== me.id &&
          !selectedUsers.some((selected) => selected.id === u.id) &&
          (u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase())),
      ),
    [state.users, me.id, q, selectedUsers],
  )

  const startIndividualChat = (user: User) => {
    const t = DataAPI.chat.ensureThread([me.id, user.id])
    router.push(`/chat/${t.id}`)
  }

  const createGroupChat = () => {
    if (selectedUsers.length === 0) return

    const participantIds = [me.id, ...selectedUsers.map((u) => u.id)]
    const name = chatType === "department" ? departmentName : groupName

    const t = DataAPI.chat.ensureThread(participantIds, name)
    router.push(`/chat/${t.id}`)
  }

  const toggleUserSelection = (user: User) => {
    setSelectedUsers((prev) =>
      prev.some((u) => u.id === user.id) ? prev.filter((u) => u.id !== user.id) : [...prev, user],
    )
  }

  const chatTypes = [
    {
      key: "individual" as ChatType,
      label: "Direct Message",
      icon: <MessageCircleIcon />,
      description: "One-on-one conversation",
    },
    { key: "group" as ChatType, label: "Group Chat", icon: <UsersIcon />, description: "Chat with multiple people" },
    {
      key: "department" as ChatType,
      label: "Department Chat",
      icon: <BuildingIcon />,
      description: "Official department communication",
    },
  ]

  return (
    <div className="mx-auto w-full max-w-2xl p-4 md:p-6">
      <Card className="bg-white/10 backdrop-blur-lg border border-white/20">
        <CardHeader>
          <CardTitle className="text-foreground">Start a new chat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Chat Type</h3>
            <div className="grid grid-cols-1 gap-3">
              {chatTypes.map(({ key, label, icon, description }) => (
                <button
                  key={key}
                  onClick={() => {
                    setChatType(key)
                    setSelectedUsers([])
                    setGroupName("")
                    setDepartmentName("")
                  }}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors text-left ${
                    chatType === key ? "border-primary bg-primary/10" : "border-white/20 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      key === "department" ? "bg-orange-500" : key === "group" ? "bg-green-500" : "bg-primary"
                    } text-white`}
                  >
                    {icon}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{label}</div>
                    <div className="text-sm text-muted-foreground">{description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {(chatType === "group" || chatType === "department") && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {chatType === "department" ? "Department Name" : "Group Name"}
              </label>
              <Input
                placeholder={chatType === "department" ? "e.g., Engineering Department" : "e.g., Project Team"}
                value={chatType === "department" ? departmentName : groupName}
                onChange={(e) =>
                  chatType === "department" ? setDepartmentName(e.target.value) : setGroupName(e.target.value)
                }
                className="bg-white/10 backdrop-blur-md border-white/20"
              />
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">
                {chatType === "individual" ? "Select person to message" : "Add participants"}
              </h3>
              {selectedUsers.length > 0 && (
                <span className="text-xs text-muted-foreground bg-white/20 px-2 py-1 rounded">
                  {selectedUsers.length} selected
                </span>
              )}
            </div>

            <Input
              placeholder="Search people…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="bg-white/10 backdrop-blur-md border-white/20"
            />

            {selectedUsers.length > 0 && chatType !== "individual" && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground">Selected participants:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-2 bg-primary/20 text-primary px-2 py-1 rounded-md text-sm"
                    >
                      <span>{user.name}</span>
                      <button
                        onClick={() => toggleUserSelection(user)}
                        className="hover:bg-primary/30 rounded-full p-0.5"
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {list.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between rounded-md border border-white/20 bg-white/10 backdrop-blur-md p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-foreground">{u.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{u.email}</div>
                  </div>
                  {chatType === "individual" ? (
                    <Button
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={() => startIndividualChat(u)}
                    >
                      Message
                    </Button>
                  ) : (
                    <Button
                      variant={selectedUsers.some((selected) => selected.id === u.id) ? "secondary" : "outline"}
                      onClick={() => toggleUserSelection(u)}
                      className="bg-white/10 backdrop-blur-md border-white/20"
                    >
                      {selectedUsers.some((selected) => selected.id === u.id) ? "Remove" : "Add"}
                    </Button>
                  )}
                </li>
              ))}
              {list.length === 0 && <li className="p-3 text-sm text-muted-foreground">No matches.</li>}
            </ul>

            {chatType !== "individual" && selectedUsers.length > 0 && (
              <Button
                onClick={createGroupChat}
                disabled={
                  selectedUsers.length === 0 ||
                  (chatType === "group" && !groupName.trim()) ||
                  (chatType === "department" && !departmentName.trim())
                }
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Create {chatType === "department" ? "Department" : "Group"} Chat
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
