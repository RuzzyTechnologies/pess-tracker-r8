"use client"

import * as React from "react"
import { useData, DataAPI, getCurrentUser } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Save } from "lucide-react"

export default function AdminSettingsView() {
  const [state, update] = useData((d) => ({ users: d.users }))
  const me = React.useMemo(() => getCurrentUser(), [state.users])

  const [isLoading, setIsLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = React.useState("")

  const [formData, setFormData] = React.useState({
    name: me?.name || "",
    email: me?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [notifications, setNotifications] = React.useState({
    emailNotifications: true,
    pushNotifications: true,
    taskAssignments: true,
    projectUpdates: true,
    weeklyDigest: true,
  })

  const [accountPrefs, setAccountPrefs] = React.useState({
    twoFactorAuth: false,
    showEmailToTeam: true,
    allowCalendarSync: false,
  })

  if (!me) {
    return <div className="p-6 text-sm text-muted-foreground">No current user found.</div>
  }

  const handleProfileUpdate = async () => {
    setIsLoading(true)
    setErrors({})
    setSuccessMessage("")

    try {
      if (!formData.name.trim()) {
        setErrors({ name: "Name is required" })
        return
      }

      if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
        setErrors({ email: "Valid email is required" })
        return
      }

      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

      DataAPI.updateUser(me.id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
      })
      update((d) => d)
      setSuccessMessage("Profile updated successfully!")

      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      setErrors({ general: "Failed to update profile. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    setIsLoading(true)
    setErrors({})
    setSuccessMessage("")

    try {
      if (!formData.currentPassword) {
        setErrors({ currentPassword: "Current password is required" })
        return
      }

      if (!formData.newPassword || formData.newPassword.length < 8) {
        setErrors({ newPassword: "New password must be at least 8 characters" })
        return
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setErrors({ confirmPassword: "Passwords do not match" })
        return
      }

      await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate API call

      setFormData((prev) => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }))
      setSuccessMessage("Password updated successfully!")

      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      setErrors({ general: "Failed to update password. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfilePictureUpload = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        setIsLoading(true)
        try {
          // Simulate upload
          await new Promise((resolve) => setTimeout(resolve, 2000))
          setSuccessMessage("Profile picture updated successfully!")
          setTimeout(() => setSuccessMessage(""), 3000)
        } catch (error) {
          setErrors({ general: "Failed to upload profile picture" })
        } finally {
          setIsLoading(false)
        }
      }
    }
    input.click()
  }

  const handleNotificationSave = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSuccessMessage("Notification settings saved!")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      setErrors({ general: "Failed to save notification settings" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Settings</h1>

      {successMessage && (
        <div className="p-3 rounded-md bg-green-100 border border-green-300 text-green-800 text-sm">
          {successMessage}
        </div>
      )}
      {errors.general && (
        <div className="p-3 rounded-md bg-red-100 border border-red-300 text-red-800 text-sm">{errors.general}</div>
      )}

      <Card className="backdrop-blur-lg supports-[backdrop-filter]:bg-white/10 border border-white/20 shadow-lg dark:supports-[backdrop-filter]:bg-slate-900/10 dark:border-slate-700/30">
        <CardHeader>
          <CardTitle className="text-foreground">Profile Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src="/placeholder.svg" alt={me.name} />
                <AvatarFallback className="text-lg">{me.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="outline"
                onClick={handleProfilePictureUpload}
                disabled={isLoading}
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 border-white/20 bg-transparent"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-foreground">{me.name}</h3>
              <p className="text-sm text-muted-foreground">{me.email}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="border-white/20 dark:border-slate-700/30"
                disabled={isLoading}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="border-white/20 dark:border-slate-700/30"
                disabled={isLoading}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>
          </div>

          <Button onClick={handleProfileUpdate} disabled={isLoading} className="bg-sky-600 text-white hover:bg-sky-700">
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Saving..." : "Save Profile"}
          </Button>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-lg supports-[backdrop-filter]:bg-white/10 border border-white/20 shadow-lg dark:supports-[backdrop-filter]:bg-slate-900/10 dark:border-slate-700/30">
        <CardHeader>
          <CardTitle className="text-foreground">Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData((prev) => ({ ...prev, currentPassword: e.target.value }))}
              className="border-white/20 dark:border-slate-700/30"
              disabled={isLoading}
            />
            {errors.currentPassword && <p className="text-sm text-red-500">{errors.currentPassword}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData((prev) => ({ ...prev, newPassword: e.target.value }))}
                className="border-white/20 dark:border-slate-700/30"
                disabled={isLoading}
              />
              {errors.newPassword && <p className="text-sm text-red-500">{errors.newPassword}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                className="border-white/20 dark:border-slate-700/30"
                disabled={isLoading}
              />
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>
          </div>
          <Button
            onClick={handlePasswordChange}
            disabled={isLoading}
            variant="outline"
            className="border-white/20 bg-transparent"
          >
            {isLoading ? "Updating..." : "Update Password"}
          </Button>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-lg supports-[backdrop-filter]:bg-white/10 border border-white/20 shadow-lg dark:supports-[backdrop-filter]:bg-slate-900/10 dark:border-slate-700/30">
        <CardHeader>
          <CardTitle className="text-foreground">Notification Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 rounded-md border border-white/20 bg-white/10 backdrop-blur-md dark:border-slate-700/30 dark:bg-slate-900/10">
              <span className="text-sm">Email notifications</span>
              <Switch
                checked={notifications.emailNotifications}
                onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, emailNotifications: checked }))}
                disabled={isLoading}
              />
            </label>
            <label className="flex items-center justify-between p-3 rounded-md border border-white/20 bg-white/10 backdrop-blur-md dark:border-slate-700/30 dark:bg-slate-900/10">
              <span className="text-sm">Push notifications</span>
              <Switch
                checked={notifications.pushNotifications}
                onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, pushNotifications: checked }))}
                disabled={isLoading}
              />
            </label>
            <label className="flex items-center justify-between p-3 rounded-md border border-white/20 bg-white/10 backdrop-blur-md dark:border-slate-700/30 dark:bg-slate-900/10">
              <span className="text-sm">Task assignments</span>
              <Switch
                checked={notifications.taskAssignments}
                onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, taskAssignments: checked }))}
                disabled={isLoading}
              />
            </label>
            <label className="flex items-center justify-between p-3 rounded-md border border-white/20 bg-white/10 backdrop-blur-md dark:border-slate-700/30 dark:bg-slate-900/10">
              <span className="text-sm">Project updates</span>
              <Switch
                checked={notifications.projectUpdates}
                onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, projectUpdates: checked }))}
                disabled={isLoading}
              />
            </label>
            <label className="flex items-center justify-between p-3 rounded-md border border-white/20 bg-white/10 backdrop-blur-md dark:border-slate-700/30 dark:bg-slate-900/10">
              <span className="text-sm">Weekly digest</span>
              <Switch
                checked={notifications.weeklyDigest}
                onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, weeklyDigest: checked }))}
                disabled={isLoading}
              />
            </label>
          </div>
          <Button
            onClick={handleNotificationSave}
            disabled={isLoading}
            variant="outline"
            className="border-white/20 bg-transparent"
          >
            {isLoading ? "Saving..." : "Save Notification Settings"}
          </Button>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-lg supports-[backdrop-filter]:bg-white/10 border border-white/20 shadow-lg dark:supports-[backdrop-filter]:bg-slate-900/10 dark:border-slate-700/30">
        <CardHeader>
          <CardTitle className="text-foreground">Account Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 rounded-md border border-white/20 bg-white/10 backdrop-blur-md dark:border-slate-700/30 dark:bg-slate-900/10">
              <span className="text-sm">Two-factor authentication</span>
              <Switch
                checked={accountPrefs.twoFactorAuth}
                onCheckedChange={(checked) => setAccountPrefs((prev) => ({ ...prev, twoFactorAuth: checked }))}
                disabled={isLoading}
              />
            </label>
            <label className="flex items-center justify-between p-3 rounded-md border border-white/20 bg-white/10 backdrop-blur-md dark:border-slate-700/30 dark:bg-slate-900/10">
              <span className="text-sm">Show email to team members</span>
              <Switch
                checked={accountPrefs.showEmailToTeam}
                onCheckedChange={(checked) => setAccountPrefs((prev) => ({ ...prev, showEmailToTeam: checked }))}
                disabled={isLoading}
              />
            </label>
            <label className="flex items-center justify-between p-3 rounded-md border border-white/20 bg-white/10 backdrop-blur-md dark:border-slate-700/30 dark:bg-slate-900/10">
              <span className="text-sm">Allow calendar sync</span>
              <Switch
                checked={accountPrefs.allowCalendarSync}
                onCheckedChange={(checked) => setAccountPrefs((prev) => ({ ...prev, allowCalendarSync: checked }))}
                disabled={isLoading}
              />
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground">Changes are saved when you click the respective save buttons.</div>
    </div>
  )
}
