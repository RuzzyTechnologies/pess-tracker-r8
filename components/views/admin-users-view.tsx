"use client"

import * as React from "react"
import { useData, DataAPI, isOnline, ONLINE_WINDOW_MS, type User } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { UserPlus } from "lucide-react"

function timeAgo(iso?: string): string {
  if (!iso) return "never"
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60_000) return "just now"
  const m = Math.floor(diff / 60_000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

export default function AdminUsersView() {
  const [state, update] = useData((d) => ({ users: d.users }))
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [role, setRole] = React.useState<User["role"]>("staff")
  const [onlineOnly, setOnlineOnly] = React.useState(false)
  const [q, setQ] = React.useState("")
  // Local tick to update "Online"/"Last seen" without data writes (e.g., user goes offline)
  const [, force] = React.useReducer((x) => x + 1, 0)
  React.useEffect(() => {
    const t = setInterval(force, 5_000)
    return () => clearInterval(t)
  }, [])

  const invite = () => {
    if (!email.trim()) return
    DataAPI.addUser({ name: name.trim() || email.split("@")[0], email: email.trim().toLowerCase(), role })
    setName("")
    setEmail("")
  }

  const changeRole = (id: string, role: User["role"]) =>
    update((d) => ({ ...d, users: d.users.map((u) => (u.id === id ? { ...u, role } : u)) }))

  const onlineCount = state.users.filter((u) => isOnline(u)).length
  const total = state.users.length

  const filtered = React.useMemo(() => {
    const term = q.trim().toLowerCase()
    return state.users
      .filter((u) => (onlineOnly ? isOnline(u) : true))
      .filter((u) => {
        if (!term) return true
        return u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
      })
      .sort((a, b) => Number(isOnline(b)) - Number(isOnline(a)))
  }, [state.users, onlineOnly, q])

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-6 space-y-4">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Teams & Users</h1>

      {/* Presence overview */}
      <Card className="backdrop-blur supports-[backdrop-filter]:bg-white/75 border border-sky-100/70 shadow-sm dark:supports-[backdrop-filter]:bg-slate-900/70 dark:border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-slate-800 dark:text-slate-100">Active status</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-sky-100/70 bg-white/70 p-3 text-sm dark:border-slate-800 dark:bg-slate-900/70">
            <div className="text-xs text-slate-500 dark:text-slate-400">Online now</div>
            <div className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              {onlineCount}
            </div>
          </div>
          <div className="rounded-md border border-sky-100/70 bg-white/70 p-3 text-sm dark:border-slate-800 dark:bg-slate-900/70">
            <div className="text-xs text-slate-500 dark:text-slate-400">Total accounts</div>
            <div className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{total}</div>
          </div>
          <div className="rounded-md border border-sky-100/70 bg-white/70 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
            Users are online if active within the last {Math.round(ONLINE_WINDOW_MS / 1000)}s.
          </div>
        </CardContent>
      </Card>

      {/* Invite */}
      <Card className="backdrop-blur supports-[backdrop-filter]:bg-white/75 border border-sky-100/70 shadow-sm dark:supports-[backdrop-filter]:bg-slate-900/70 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-800 dark:text-slate-100">Invite user</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-5">
          <div className="space-y-2 sm:col-span-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-sky-100 dark:border-slate-700"
              placeholder="Jane Smith"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-sky-100 dark:border-slate-700"
              placeholder="jane@example.com"
            />
          </div>
          <div className="space-y-2 sm:col-span-1">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as any)}>
              <SelectTrigger className="border-sky-100 dark:border-slate-700">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-5">
            <Button className="bg-sky-600 text-white hover:bg-sky-700" onClick={invite}>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Members + Presence controls */}
      <Card className="backdrop-blur supports-[backdrop-filter]:bg-white/75 border border-sky-100/70 shadow-sm dark:supports-[backdrop-filter]:bg-slate-900/70 dark:border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-slate-800 dark:text-slate-100">Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Search members..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-9 w-[240px] border-sky-100 dark:border-slate-700"
            />
            <label className="inline-flex items-center gap-2 text-sm">
              <Switch checked={onlineOnly} onCheckedChange={setOnlineOnly} />
              Online only
            </label>
          </div>

          {filtered.map((u) => {
            const online = isOnline(u)
            return (
              <div
                key={u.id}
                className="flex flex-col gap-2 rounded-md border border-sky-100/70 bg-white/70 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900/70"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={["inline-block h-2 w-2 rounded-full", online ? "bg-emerald-500" : "bg-slate-400"].join(
                        " ",
                      )}
                      aria-label={online ? "Online" : "Offline"}
                      title={online ? "Online" : "Offline"}
                    />
                    <span className="truncate font-medium text-slate-900 dark:text-slate-100">{u.name}</span>
                    <span className="truncate text-xs text-slate-500 dark:text-slate-400">({u.email})</span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    {online ? "Online" : `Last seen ${timeAgo(u.lastActiveAt)}`}
                  </div>
                </div>

                <Select value={u.role} onValueChange={(v) => changeRole(u.id, v as User["role"])}>
                  <SelectTrigger className="h-8 w-[160px] border-sky-200 dark:border-slate-700">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="p-2 text-sm text-slate-500 dark:text-slate-400">No members found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
