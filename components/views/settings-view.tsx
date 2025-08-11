"use client"

import * as React from "react"
import { useData } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function SettingsView() {
  const [user, update] = useData((d) => d.users[0])

  const [name, setName] = React.useState(user?.name ?? "")
  const [email, setEmail] = React.useState(user?.email ?? "")

  const save = () =>
    update((d) => ({
      ...d,
      users: d.users.map((u) =>
        u.id === user.id ? { ...u, name: name.trim() || u.name, email: email.trim() || u.email } : u,
      ),
    }))

  return (
    <div className="mx-auto w-full max-w-3xl p-4 md:p-6 space-y-4">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Settings</h1>
      <Card className="backdrop-blur supports-[backdrop-filter]:bg-white/75 border border-sky-100/70 shadow-sm dark:supports-[backdrop-filter]:bg-slate-900/70 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-800 dark:text-slate-100">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-sky-100 dark:border-slate-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-sky-100 dark:border-slate-700"
            />
          </div>
          <Button className="bg-sky-600 text-white hover:bg-sky-700" onClick={save}>
            Save changes
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
