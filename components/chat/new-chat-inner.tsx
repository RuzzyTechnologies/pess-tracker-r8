"use client"

import * as React from "react"
import { useData, getCurrentUser, DataAPI, type User } from "@/lib/data"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function NewChatInner() {
  const [state] = useData((d) => ({ users: d.users }))
  const me = getCurrentUser()!
  const [q, setQ] = React.useState("")
  const router = useRouter()

  const list = React.useMemo(
    () =>
      state.users.filter(
        (u) =>
          u.id !== me.id &&
          (u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase())),
      ),
    [state.users, me.id, q],
  )

  const startChat = (user: User) => {
    const t = DataAPI.chat.ensureThread([me.id, user.id])
    router.push(`/chat/${t.id}`)
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-4 md:p-6">
      <Card className="backdrop-blur supports-[backdrop-filter]:bg-white/75 border border-sky-100/70 shadow-sm dark:supports-[backdrop-filter]:bg-slate-900/70 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-800 dark:text-slate-100">Start a new chat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Search people…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="border-sky-100 dark:border-slate-700"
          />
          <ul className="space-y-2">
            {list.map((u) => (
              <li
                key={u.id}
                className="flex items-center justify-between rounded-md border border-sky-100/70 bg-white/70 p-2 dark:border-slate-800 dark:bg-slate-900/70"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{u.name}</div>
                  <div className="truncate text-xs text-slate-500 dark:text-slate-400">{u.email}</div>
                </div>
                <Button className="bg-sky-600 text-white hover:bg-sky-700" onClick={() => startChat(u)}>
                  Message
                </Button>
              </li>
            ))}
            {list.length === 0 && <li className="p-2 text-sm text-slate-500 dark:text-slate-400">No matches.</li>}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
