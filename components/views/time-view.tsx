"use client"

import * as React from "react"
import { useData, DataAPI } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function TimeView() {
  const [entries, update] = useData((d) => d.timeEntries)
  const [minutes, setMinutes] = React.useState<number>(30)
  const [date, setDate] = React.useState<string>(new Date().toISOString().slice(0, 10))

  const totalToday = entries.filter((e) => e.date === date).reduce((sum, e) => sum + e.minutes, 0)

  return (
    <div className="mx-auto w-full max-w-3xl p-4 md:p-6 space-y-4">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Time Tracker</h1>
      <Card className="backdrop-blur supports-[backdrop-filter]:bg-white/75 border border-sky-100/70 shadow-sm dark:supports-[backdrop-filter]:bg-slate-900/70 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-800 dark:text-white">Log time</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border-sky-100 dark:border-slate-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minutes">Minutes</Label>
              <Input
                id="minutes"
                type="number"
                min={5}
                step={5}
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="border-sky-100 dark:border-slate-700"
              />
            </div>
          </div>
          <Button
            className="bg-sky-600 text-white hover:bg-sky-700"
            onClick={() => {
              if (minutes <= 0) return
              DataAPI.addTimeEntry({ minutes, date })
              update((d) => d)
            }}
          >
            Add Entry
          </Button>

          <div className="text-sm text-slate-600 dark:text-slate-200">
            {"Total today: "}
            <span className="font-medium text-slate-900 dark:text-white">
              {Math.round(totalToday / 60)}h {totalToday % 60}m
            </span>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-800 dark:text-white">Entries</div>
            <ul className="space-y-2">
              {entries.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between rounded-md border border-sky-100/70 bg-white/70 p-2 text-sm dark:border-slate-800 dark:bg-slate-900/70"
                >
                  <span>
                    {e.date} · {e.minutes}m
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
