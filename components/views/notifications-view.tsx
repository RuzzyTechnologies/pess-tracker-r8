"use client"

import { useData, DataAPI } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function NotificationsView() {
  const [items, update] = useData((d) => d.notifications)

  const markAllRead = () => {
    update((d) => ({ ...d, notifications: d.notifications.map((n) => ({ ...n, read: true })) }))
  }

  return (
    <div className="mx-auto w-full max-w-5xl p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Notifications</h1>
        <Button
          variant="outline"
          className="border-sky-200 text-sky-700 hover:bg-sky-50 dark:border-slate-700 dark:text-sky-300 dark:hover:bg-slate-800/60 bg-transparent"
          onClick={markAllRead}
        >
          Mark all as read
        </Button>
      </div>
      <Card className="backdrop-blur supports-[backdrop-filter]:bg-white/75 border border-sky-100/70 shadow-sm dark:supports-[backdrop-filter]:bg-slate-900/70 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-800 dark:text-slate-100">Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 ? (
            <div className="text-sm text-slate-500 dark:text-slate-400">You're all caught up 🎉</div>
          ) : (
            <ul className="space-y-3">
              {items.map((n) => (
                <li
                  key={n.id}
                  className="flex items-center justify-between rounded-md border border-sky-100/70 bg-white/70 p-3 text-sm dark:border-slate-800 dark:bg-slate-900/70"
                >
                  <span
                    className={n.read ? "text-slate-500 dark:text-slate-400" : "text-slate-800 dark:text-slate-100"}
                  >
                    {n.message}
                  </span>
                  <Button
                    variant="outline"
                    className="h-8 border-sky-200 text-sky-700 hover:bg-sky-50 dark:border-slate-700 dark:text-sky-300 dark:hover:bg-slate-800/60 bg-transparent"
                    onClick={() => DataAPI.markNotification(n.id, !n.read)}
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
