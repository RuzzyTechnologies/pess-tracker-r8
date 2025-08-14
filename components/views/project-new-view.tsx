"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { DataAPI } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ProjectNewView() {
  const router = useRouter()
  const [name, setName] = React.useState("")
  const [desc, setDesc] = React.useState("")
  const [status, setStatus] = React.useState<"Planning" | "In Progress" | "Review" | "Completed">("Planning")

  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string>("")

  const handleSubmit = async () => {
    if (isSubmitting) return

    // Validation
    if (!name.trim()) {
      setError("Project name is required")
      return
    }

    if (name.trim().length < 3) {
      setError("Project name must be at least 3 characters long")
      return
    }

    setError("")
    setIsSubmitting(true)

    try {
      DataAPI.addProject({ name: name.trim(), description: desc.trim(), status })
      router.push("/projects")
    } catch (err) {
      setError("Failed to create project. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-4 md:p-6">
      <Card className="backdrop-blur supports-[backdrop-filter]:bg-white/75 border border-sky-100/70 shadow-sm dark:supports-[backdrop-filter]:bg-slate-900/70 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-800 dark:text-white">New Project</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Website Revamp"
              className="border-sky-100 dark:border-slate-700"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Input
              id="desc"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="What is this project about?"
              className="border-sky-100 dark:border-slate-700"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as any)} disabled={isSubmitting}>
              <SelectTrigger className="border-sky-100 dark:border-slate-700">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Planning">Planning</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Review">Review</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button className="bg-sky-600 text-white hover:bg-sky-700" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Project"}
            </Button>
            <Button
              variant="outline"
              className="border-sky-200 dark:border-slate-700 bg-transparent"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
