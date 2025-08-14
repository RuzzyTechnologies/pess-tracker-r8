"use client"

import { useData } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

export default function NotificationsView() {
  const [items, update] = useData((d) => d.notifications)
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const markAllRead = () => {
    update((d) => ({ ...d, notifications: d.notifications.map((n) => ({ ...n, read: true })) }))
  }

  return (
    <div className="mx-auto w-full max-w-5xl p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold" style={{ color: isDark ? "#ffffff" : "#0f172a" }}>
          Notifications
        </h1>
        <Button
          variant="outline"
          className="border-sky-200 text-sky-700 hover:bg-sky-50 dark:border-slate-700 dark:text-sky-300 dark:hover:bg-slate-800/60 bg-transparent"
          onClick={markAllRead}
        >
          Mark all as read
        </Button>
      </div>
      <Card className="backdrop-blur-lg supports-[backdrop-filter]:bg-white/10 border border-white/20 shadow-lg dark:supports-[backdrop-filter]:bg-slate-900/10 dark:border-slate-700/30">
        <CardHeader>
          <CardTitle style={{ color: isDark ? "#ffffff" : "#1e293b" }}>Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 ? (
            <div className="text-sm" style={{ color: isDark ? "#ffffff" : "#64748b" }}>
              You're all caught up 🎉
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((n) => (
                <li
                  key={n.id}
                  className="flex items-center justify-between rounded-md border border-white/20 bg-white/10 backdrop-blur-md p-3 text-sm dark:border-slate-700/30 dark:bg-slate-900/10"
                >
                  <span
                    style={{
                      color: isDark ? "#ffffff" : n.read ? "#64748b" : "#1e293b",
                    }}
                  >
                    {n.message}
                  </span>
                  <Button
                    variant="outline"
                    className="h-8 border-sky-200 text-sky-700 hover:bg-sky-50 dark:border-slate-700 dark:text-sky-300 dark:hover:bg-slate-800/60 bg-transparent"
                    onClick={() =>
                      update((d) => ({
                        ...d,
                        notifications: d.notifications.map((notification) =>
                          notification.id === n.id ? { ...notification, read: !notification.read } : notification,
                        ),
                      }))
                    }
                  >
                    {n.read ? "Mark unread" : "Mark read"}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
