"use client"

import * as React from "react"
import { useData, DataAPI, type OrgSettings } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Trash2, Download, Plus } from "lucide-react"

export default function AdminSettingsView() {
  const [state, update] = useData((d) => ({ org: d.org, users: d.users, projects: d.projects }))
  const { org } = state

  const [newStatus, setNewStatus] = React.useState("")

  const togglePermission = (group: "createProject" | "createTask", role: string) => {
    const set = new Set(org.permissions[group])
    if (set.has(role as any)) set.delete(role as any)
    else set.add(role as any)
    DataAPI.updateOrg({ permissions: { ...org.permissions, [group]: Array.from(set) as any } })
    update((d) => d)
  }

  const toggleWorkday = (day: number) => {
    const set = new Set(org.workdays)
    if (set.has(day)) set.delete(day)
    else set.add(day)
    DataAPI.updateOrg({ workdays: Array.from(set).sort((a, b) => a - b) })
    update((d) => d)
  }

  const addStatus = () => {
    const s = newStatus.trim()
    if (!s) return
    if (org.statuses.includes(s)) return
    DataAPI.setOrgStatuses([...org.statuses, s])
    setNewStatus("")
    update((d) => d)
  }

  const removeStatus = (s: string) => {
    const base = ["Planning", "In Progress", "Review", "Completed"]
    if (base.includes(s)) return
    DataAPI.setOrgStatuses(org.statuses.filter((x) => x !== s))
    update((d) => d)
  }

  const exportData = () => {
    const text = DataAPI.exportJSON()
    const blob = new Blob([text], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "pess-export.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-6 space-y-5">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Organization Settings</h1>

      <Card className="backdrop-blur supports-[backdrop-filter]:bg-white/75 border border-sky-100/70 shadow-sm dark:supports-[backdrop-filter]:bg-slate-900/70 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-800 dark:text-slate-100">General</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="orgname">Organization name</Label>
            <Input
              id="orgname"
              defaultValue={org.name}
              className="border-sky-100 dark:border-slate-700"
              onBlur={(e) => {
                const v = e.currentTarget.value.trim()
                if (v && v !== org.name) DataAPI.updateOrg({ name: v })
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>Week starts on</Label>
            <Select
              value={org.weekStart}
              onValueChange={(v) => DataAPI.updateOrg({ weekStart: v as OrgSettings["weekStart"] })}
            >
              <SelectTrigger className="border-sky-100 dark:border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sunday">Sunday</SelectItem>
                <SelectItem value="Monday">Monday</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="workday">Workday length (minutes)</Label>
            <Input
              id="workday"
              type="number"
              min={60}
              step={15}
              defaultValue={org.workdayMinutes}
              className="border-sky-100 dark:border-slate-700"
              onBlur={(e) => {
                const n = Math.max(60, Number(e.currentTarget.value || 480))
                if (n !== org.workdayMinutes) DataAPI.updateOrg({ workdayMinutes: n })
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>Workdays</Label>
            <div className="flex flex-wrap gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((lbl, i) => {
                const active = org.workdays.includes(i)
                return (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => toggleWorkday(i)}
                    className={[
                      "h-8 rounded-md px-2 text-sm ring-1",
                      active
                        ? "bg-sky-600 text-white ring-sky-600"
                        : "bg-white text-slate-700 ring-sky-100 hover:bg-sky-50 dark:bg-slate-900/70 dark:text-slate-300 dark:ring-slate-800 dark:hover:bg-slate-800/60",
                    ].join(" ")}
                    aria-pressed={active}
                  >
                    {lbl}
                  </button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="backdrop-blur supports-[backdrop-filter]:bg-white/75 border border-sky-100/70 shadow-sm dark:supports-[backdrop-filter]:bg-slate-900/70 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-800 dark:text-slate-100">Permissions & Approvals</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Create Project</Label>
              <div className="flex items-center gap-4">
                {(["admin", "manager"] as const).map((r) => (
                  <label key={r} className="inline-flex items-center gap-2 text-sm">
                    <Switch
                      checked={org.permissions.createProject.includes(r)}
                      onCheckedChange={() => togglePermission("createProject", r)}
                    />
                    <span className="capitalize">{r}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Create Task</Label>
              <div className="flex flex-wrap items-center gap-4">
                {(["admin", "manager", "staff"] as const).map((r) => (
                  <label key={r} className="inline-flex items-center gap-2 text-sm">
                    <Switch
                      checked={org.permissions.createTask.includes(r)}
                      onCheckedChange={() => togglePermission("createTask", r)}
                    />
                    <span className="capitalize">{r}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="inline-flex items-center justify-between gap-2 rounded-md border border-sky-100/70 bg-white/70 p-3 text-sm dark:border-slate-800 dark:bg-slate-900/70">
              <span>Require approval for new projects</span>
              <Switch
                checked={org.approvals.requireForProject}
                onCheckedChange={(v) => DataAPI.updateOrg({ approvals: { ...org.approvals, requireForProject: v } })}
              />
            </label>
            <label className="inline-flex items-center justify-between gap-2 rounded-md border border-sky-100/70 bg-white/70 p-3 text-sm dark:border-slate-800 dark:bg-slate-900/70">
              <span>Require approval for High priority tasks</span>
              <Switch
                checked={org.approvals.requireForHighPriorityTasks}
                onCheckedChange={(v) =>
                  DataAPI.updateOrg({ approvals: { ...org.approvals, requireForHighPriorityTasks: v } })
                }
              />
            </label>
          </div>
        </CardContent>
      </Card>

      <Card className="backdrop-blur supports-[backdrop-filter]:bg-white/75 border border-sky-100/70 shadow-sm dark:supports-[backdrop-filter]:bg-slate-900/70 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-800 dark:text-slate-100">Workflow Statuses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {org.statuses.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs text-sky-700 ring-1 ring-sky-100"
              >
                {s}
                {!["Planning", "In Progress", "Review", "Completed"].includes(s) && (
                  <button
                    className="text-red-600 hover:text-red-700"
                    onClick={() => removeStatus(s)}
                    aria-label={`Remove ${s}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              placeholder="Add a status"
              className="max-w-xs border-sky-100 dark:border-slate-700"
            />
            <Button onClick={addStatus} className="bg-sky-600 text-white hover:bg-sky-700">
              <Plus className="mr-2 h-4 w-4" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="backdrop-blur supports-[backdrop-filter]:bg-white/75 border border-sky-100/70 shadow-sm dark:supports-[backdrop-filter]:bg-slate-900/70 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-800 dark:text-slate-100">Notifications & Security</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Digest</Label>
            <Select
              value={org.notifications.digest}
              onValueChange={(v) =>
                DataAPI.updateOrg({
                  notifications: { ...org.notifications, digest: v as OrgSettings["notifications"]["digest"] },
                })
              }
            >
              <SelectTrigger className="border-sky-100 dark:border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="off">Off</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <label className="inline-flex items-center justify-between gap-2 rounded-md border border-sky-100/70 bg-white/70 p-3 text-sm dark:border-slate-800 dark:bg-slate-900/70">
            <span>Require 2FA for members</span>
            <Switch
              checked={org.security.require2FA}
              onCheckedChange={(v) => DataAPI.updateOrg({ security: { ...org.security, require2FA: v } })}
            />
          </label>
          <label className="inline-flex items-center justify-between gap-2 rounded-md border border-sky-100/70 bg-white/70 p-3 text-sm dark:border-slate-800 dark:bg-slate-900/70">
            <span>Allow public projects</span>
            <Switch
              checked={org.security.allowPublicProjects}
              onCheckedChange={(v) => DataAPI.updateOrg({ security: { ...org.security, allowPublicProjects: v } })}
            />
          </label>
          <div className="space-y-2">
            <Label htmlFor="domain">Invite domain restriction</Label>
            <Input
              id="domain"
              placeholder="e.g. company.com"
              defaultValue={org.security.inviteDomain || ""}
              className="border-sky-100 dark:border-slate-700"
              onBlur={(e) =>
                DataAPI.updateOrg({
                  security: { ...org.security, inviteDomain: e.currentTarget.value.trim() || undefined },
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          className="border-sky-200 text-sky-700 hover:bg-sky-50 bg-transparent dark:border-slate-700 dark:text-sky-300 dark:hover:bg-slate-800/60"
          onClick={exportData}
        >
          <Download className="mr-2 h-4 w-4" /> Export data (JSON)
        </Button>
        <Button
          variant="outline"
          className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
          onClick={() => DataAPI.resetDemo()}
        >
          Reset demo data
        </Button>
      </div>
    </div>
  )
}
