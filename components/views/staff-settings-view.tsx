"use client"

import * as React from "react"
import { useData, DataAPI, getCurrentUser, defaultUserSettings, type UserSettings } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export default function StaffSettingsView() {
  const [state, update] = useData((d) => ({ users: d.users, settings: d.userSettings }))
  const me = React.useMemo(() => {
    const u = getCurrentUser()
    return u
  }, [state.users])

  if (!me) {
    return <div className="p-6 text-sm text-slate-600 dark:text-slate-400">No current user found.</div>
  }

  const mySettings: UserSettings = (state.settings && state.settings[me.id]) || defaultUserSettings()

  const updateProfile = (patch: { name?: string; email?: string }) => {
    DataAPI.updateUser(me.id, patch)
    update((d) => d)
  }

  const updateSettings = (patch: Partial<UserSettings>) => {
    DataAPI.updateUserSettings(me.id, patch)
    update((d) => d)
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-4 md:p-6 space-y-5">
      <h1 className="text-xl font-semibold text-foreground">My Settings</h1>

      <Card className="backdrop-blur-lg supports-[backdrop-filter]:bg-white/10 border border-white/20 shadow-lg dark:supports-[backdrop-filter]:bg-slate-900/10 dark:border-slate-700/30">
        <CardHeader>
          <CardTitle className="text-foreground">Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              defaultValue={me.name}
              className="border-white/20 dark:border-slate-700/30"
              onBlur={(e) => updateProfile({ name: e.currentTarget.value.trim() || me.name })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              defaultValue={me.email}
              className="border-white/20 dark:border-slate-700/30"
              onBlur={(e) => updateProfile({ email: e.currentTarget.value.trim() || me.email })}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-lg supports-[backdrop-filter]:bg-white/10 border border-white/20 shadow-lg dark:supports-[backdrop-filter]:bg-slate-900/10 dark:border-slate-700/30">
        <CardHeader>
          <CardTitle className="text-foreground">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select
              value={mySettings.theme}
              onValueChange={(v) => updateSettings({ theme: v as UserSettings["theme"] })}
            >
              <SelectTrigger className="border-white/20 dark:border-slate-700/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Input
              defaultValue={mySettings.timezone}
              className="border-white/20 dark:border-slate-700/30"
              onBlur={(e) => updateSettings({ timezone: e.currentTarget.value.trim() || mySettings.timezone })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minutes">Daily focus target (minutes)</Label>
            <Input
              id="minutes"
              type="number"
              min={30}
              step={15}
              defaultValue={mySettings.dailyTargetMinutes}
              className="border-white/20 dark:border-slate-700/30"
              onBlur={(e) => {
                const n = Math.max(30, Number(e.currentTarget.value || mySettings.dailyTargetMinutes))
                if (n !== mySettings.dailyTargetMinutes) updateSettings({ dailyTargetMinutes: n })
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>Default landing page</Label>
            <Select
              value={mySettings.defaults.landingPage}
              onValueChange={(v) => updateSettings({ defaults: { ...mySettings.defaults, landingPage: v as any } })}
            >
              <SelectTrigger className="border-white/20 dark:border-slate-700/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dashboard">Dashboard</SelectItem>
                <SelectItem value="projects">Projects</SelectItem>
                <SelectItem value="tasks">Tasks</SelectItem>
                <SelectItem value="notifications">Notifications</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Default task priority</Label>
            <Select
              value={mySettings.defaults.defaultPriority}
              onValueChange={(v) => updateSettings({ defaults: { ...mySettings.defaults, defaultPriority: v as any } })}
            >
              <SelectTrigger className="border-white/20 dark:border-slate-700/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-lg supports-[backdrop-filter]:bg-white/10 border border-white/20 shadow-lg dark:supports-[backdrop-filter]:bg-slate-900/10 dark:border-slate-700/30">
        <CardHeader>
          <CardTitle className="text-foreground">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <label className="inline-flex items-center justify-between gap-2 rounded-md border border-white/20 bg-white/10 backdrop-blur-md p-3 text-sm dark:border-slate-700/30 dark:bg-slate-900/10">
            <span>Email notifications</span>
            <Switch
              checked={mySettings.notifications.email}
              onCheckedChange={(v) => updateSettings({ notifications: { ...mySettings.notifications, email: v } })}
            />
          </label>
          <label className="inline-flex items-center justify-between gap-2 rounded-md border border-white/20 bg-white/10 backdrop-blur-md p-3 text-sm dark:border-slate-700/30 dark:bg-slate-900/10">
            <span>Push notifications</span>
            <Switch
              checked={mySettings.notifications.push}
              onCheckedChange={(v) => updateSettings({ notifications: { ...mySettings.notifications, push: v } })}
            />
          </label>
          <label className="inline-flex items-center justify-between gap-2 rounded-md border border-white/20 bg-white/10 backdrop-blur-md p-3 text-sm dark:border-slate-700/30 dark:bg-slate-900/10">
            <span>When assigned a task</span>
            <Switch
              checked={mySettings.notifications.taskAssigned}
              onCheckedChange={(v) =>
                updateSettings({ notifications: { ...mySettings.notifications, taskAssigned: v } })
              }
            />
          </label>
          <label className="inline-flex items-center justify-between gap-2 rounded-md border border-white/20 bg-white/10 backdrop-blur-md p-3 text-sm dark:border-slate-700/30 dark:bg-slate-900/10">
            <span>When tasks are due soon</span>
            <Switch
              checked={mySettings.notifications.taskDueSoon}
              onCheckedChange={(v) =>
                updateSettings({ notifications: { ...mySettings.notifications, taskDueSoon: v } })
              }
            />
          </label>
          <label className="inline-flex items-center justify-between gap-2 rounded-md border border-white/20 bg-white/10 backdrop-blur-md p-3 text-sm sm:col-span-2 dark:border-slate-700/30 dark:bg-slate-900/10">
            <span>Project updates</span>
            <Switch
              checked={mySettings.notifications.projectUpdates}
              onCheckedChange={(v) =>
                updateSettings({ notifications: { ...mySettings.notifications, projectUpdates: v } })
              }
            />
          </label>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-lg supports-[backdrop-filter]:bg-white/10 border border-white/20 shadow-lg dark:supports-[backdrop-filter]:bg-slate-900/10 dark:border-slate-700/30">
        <CardHeader>
          <CardTitle className="text-foreground">Privacy & Integrations</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <label className="inline-flex items-center justify-between gap-2 rounded-md border border-white/20 bg-white/10 backdrop-blur-md p-3 text-sm dark:border-slate-700/30 dark:bg-slate-900/10">
            <span>Show my email to team members</span>
            <Switch
              checked={mySettings.privacy.showEmailToMembers}
              onCheckedChange={(v) => updateSettings({ privacy: { ...mySettings.privacy, showEmailToMembers: v } })}
            />
          </label>
          <label className="inline-flex items-center justify-between gap-2 rounded-md border border-white/20 bg-white/10 backdrop-blur-md p-3 text-sm dark:border-slate-700/30 dark:bg-slate-900/10">
            <span>Calendar sync</span>
            <Switch
              checked={mySettings.integrations.calendarSync}
              onCheckedChange={(v) => updateSettings({ integrations: { ...mySettings.integrations, calendarSync: v } })}
            />
          </label>
          <label className="inline-flex items-center justify-between gap-2 rounded-md border border-white/20 bg-white/10 backdrop-blur-md p-3 text-sm dark:border-slate-700/30 dark:bg-slate-900/10">
            <span>GitHub integration</span>
            <Switch
              checked={mySettings.integrations.github}
              onCheckedChange={(v) => updateSettings({ integrations: { ...mySettings.integrations, github: v } })}
            />
          </label>
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground">Changes are saved automatically.</div>
    </div>
  )
}
