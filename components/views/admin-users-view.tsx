"use client"

import * as React from "react"
import { useData, DataAPI, isOnline, ONLINE_WINDOW_MS, type User, getCurrentUser } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { UserPlus } from "lucide-react"

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
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null)
  const [isInviting, setIsInviting] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [me, setMe] = React.useState<User | null>(null)

  React.useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await getCurrentUser()
        setMe(user)
      } catch (err) {
        console.log("[v0] Error getting current user:", err)
        setMe(null)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCurrentUser()
  }, [])

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

  // Local tick to update "Online"/"Last seen" without data writes (e.g., user goes offline)
  const [, force] = React.useReducer((x) => x + 1, 0)
  React.useEffect(() => {
    const t = setInterval(force, 5_000)
    return () => clearInterval(t)
  }, [])

  React.useEffect(() => {
    console.log("[v0] AdminUsersView mounted, users:", state.users)
  }, [state.users])

  const invite = async () => {
    if (!email.trim()) return
    setIsInviting(true)
    setError(null)

    try {
      console.log("[v0] Inviting user:", {
        name: name.trim() || email.split("@")[0],
        email: email.trim().toLowerCase(),
        role,
      })
      await DataAPI.addUser({ name: name.trim() || email.split("@")[0], email: email.trim().toLowerCase(), role })
      setName("")
      setEmail("")
      console.log("[v0] User invited successfully")
    } catch (err) {
      console.log("[v0] Error inviting user:", err)
      setError(err instanceof Error ? err.message : "Failed to invite user")
    } finally {
      setIsInviting(false)
    }
  }

  const changeRole = async (id: string, role: User["role"]) => {
    try {
      await DataAPI.updateUser(id, { role })
      update((d) => ({ ...d, users: d.users.map((u) => (u.id === id ? { ...u, role } : u)) }))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user role")
    }
  }

  const deleteUser = async (userId: string, userName: string) => {
    if (userId === me?.id) {
      alert("You cannot delete your own account.")
      return
    }

    if (
      window.confirm(
        `Are you sure you want to delete ${userName}? This will remove their account and all associated data. This action cannot be undone.`,
      )
    ) {
      setIsDeleting(userId)
      setError(null)

      try {
        await DataAPI.deleteUser(userId)
        setDeleteConfirm(null)
        update((d) => ({ ...d, users: d.users.filter((u) => u.id !== userId) }))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete user")
      } finally {
        setIsDeleting(null)
      }
    }
  }

  const onlineCount = state.users.filter((u) => isOnline(u)).length
  const total = state.users.length

  if (!me) {
    return (
      <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
        <div className="text-center text-muted-foreground">Please log in to access this page.</div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
        <div className="text-center text-muted-foreground">Loading users...</div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-6 space-y-4">
      <h1 className="text-xl font-semibold text-foreground">Teams & Users</h1>

      {error && (
        <div className="rounded-md border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
          <button onClick={() => setError(null)} className="ml-2 text-red-500 hover:text-red-700">
            ×
          </button>
        </div>
      )}

      {/* Presence overview */}
      <Card className="backdrop-blur-lg supports-[backdrop-filter]:bg-white/10 border border-white/20 shadow-lg dark:supports-[backdrop-filter]:bg-slate-900/10 dark:border-slate-700/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-foreground">Active status</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-white/20 bg-white/10 backdrop-blur-md p-3 text-sm dark:border-slate-700/30 dark:bg-slate-900/10">
            <div className="text-xs text-muted-foreground">Online now</div>
            <div className="text-2xl font-semibold tracking-tight text-foreground">{onlineCount}</div>
          </div>
          <div className="rounded-md border border-white/20 bg-white/10 backdrop-blur-md p-3 text-sm dark:border-slate-700/30 dark:bg-slate-900/10">
            <div className="text-xs text-muted-foreground">Total accounts</div>
            <div className="text-2xl font-semibold tracking-tight text-foreground">{total}</div>
          </div>
          <div className="rounded-md border border-white/20 bg-white/10 backdrop-blur-md p-3 text-xs text-muted-foreground dark:border-slate-700/30 dark:bg-slate-900/10">
            Users are online if active within the last {Math.round(ONLINE_WINDOW_MS / 1000)}s.
          </div>
        </CardContent>
      </Card>

      {/* Invite */}
      <Card className="backdrop-blur-lg supports-[backdrop-filter]:bg-white/10 border border-white/20 shadow-lg dark:supports-[backdrop-filter]:bg-slate-900/10 dark:border-slate-700/30">
        <CardHeader>
          <CardTitle className="text-foreground">Invite user</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-5">
          <div className="space-y-2 sm:col-span-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-white/20 dark:border-slate-700/30"
              placeholder="Jane Smith"
              disabled={isInviting}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-white/20 dark:border-slate-700/30"
              placeholder="jane@example.com"
              disabled={isInviting}
            />
          </div>
          <div className="space-y-2 sm:col-span-1">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as any)} disabled={isInviting}>
              <SelectTrigger className="border-white/20 dark:border-slate-700/30">
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
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={invite}
              disabled={isInviting || !email.trim()}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {isInviting ? "Inviting..." : "Invite"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Members + Presence controls */}
      <Card className="backdrop-blur-lg supports-[backdrop-filter]:bg-white/10 border border-white/20 shadow-lg dark:supports-[backdrop-filter]:bg-slate-900/10 dark:border-slate-700/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-foreground">Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Search members..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-9 w-[240px] border-white/20 dark:border-slate-700/30"
            />
            <label className="inline-flex items-center gap-2 text-sm">
              <Switch checked={onlineOnly} onCheckedChange={setOnlineOnly} />
              Online only
            </label>
          </div>

          {filtered.map((u) => {
            const online = isOnline(u)
            const isCurrentUser = u.id === me.id
            const isBeingDeleted = isDeleting === u.id
            return (
              <div
                key={u.id}
                className="flex flex-col gap-2 rounded-md border border-white/20 bg-white/10 backdrop-blur-md p-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700/30 dark:bg-slate-900/10"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={["inline-block h-2 w-2 rounded-full", online ? "bg-emerald-500" : "bg-slate-400"].join(
                        " ",
                      )}
                      aria-label={online ? "Online" : "Offline"}
                      title={online ? "Online" : "Offline"}
                    />
                    <span className="truncate font-medium text-foreground">
                      {u.name} {isCurrentUser && "(You)"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">({u.email})</span>
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {online ? "Online" : `Last seen ${timeAgo(u.lastActiveAt)}`}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    value={u.role}
                    onValueChange={(v) => changeRole(u.id, v as User["role"])}
                    disabled={isBeingDeleted}
                  >
                    <SelectTrigger className="h-8 w-[160px] border-white/20 dark:border-slate-700/30">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>

                  {!isCurrentUser && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteUser(u.id, u.name)}
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      title={`Delete ${u.name}`}
                      disabled={isBeingDeleted}
                    >
                      {isBeingDeleted ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                      ) : (
                        <TrashIcon className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && <div className="p-2 text-sm text-muted-foreground">No members found.</div>}
        </CardContent>
      </Card>
    </div>
  )
}
