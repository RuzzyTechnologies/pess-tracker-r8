"use client"

import * as React from "react"

export type Project = {
  id: string
  name: string
  status: "Planning" | "In Progress" | "Review" | "Completed" | string
  description?: string
  createdAt: string
}

export type Task = {
  id: string
  title: string
  status: "Todo" | "In Progress" | "Done"
  priority: "Low" | "Medium" | "High"
  dueDate?: string
  projectId?: string
  assignee?: string
  assigneeId?: string
  createdById?: string
  createdAt: string
}

export type NotificationItem = {
  id: string
  message: string
  createdAt: string
  read: boolean
}

export type TimeEntry = {
  id: string
  taskId?: string
  minutes: number
  date: string
}

export type User = {
  id: string
  name: string
  email: string
  role: "admin" | "manager" | "staff"
  lastActiveAt?: string // realtime presence timestamp (ISO)
}

export type UserSettings = {
  theme: "system" | "light" | "dark"
  timezone: string
  dailyTargetMinutes: number
  notifications: {
    email: boolean
    push: boolean
    taskAssigned: boolean
    taskDueSoon: boolean
    projectUpdates: boolean
  }
  privacy: {
    showEmailToMembers: boolean
  }
  integrations: {
    calendarSync: boolean
    github: boolean
  }
  defaults: {
    landingPage: "dashboard" | "projects" | "tasks" | "notifications"
    defaultPriority: "Low" | "Medium" | "High"
  }
}

/* Chat types */
export type ChatThread = {
  id: string
  participantIds: string[]
  name?: string // Added optional name field for group and department chats
  chatType?: "individual" | "group" | "department" // Added chat type field
  createdAt: string
  lastMessageAt: string
}

export type ChatMessage = {
  id: string
  threadId: string
  senderId: string
  text: string
  createdAt: string
  readBy: string[]
}

type Data = {
  projects: Project[]
  tasks: Task[]
  notifications: NotificationItem[]
  timeEntries: TimeEntry[]
  users: User[]
  org: OrgSettings
  userSettings: Record<string, UserSettings>
  chats: ChatThread[]
  chatMessages: ChatMessage[]
}

export type OrgSettings = {
  name: string
  weekStart: "Sunday" | "Monday"
  workdayMinutes: number
  workdays: number[]
  permissions: {
    createProject: Array<"admin" | "manager">
    createTask: Array<"admin" | "manager" | "staff">
  }
  approvals: {
    requireForProject: boolean
    requireForHighPriorityTasks: boolean
  }
  notifications: {
    digest: "daily" | "weekly" | "off"
  }
  security: {
    require2FA: boolean
    allowPublicProjects: boolean
    inviteDomain?: string
  }
  statuses: string[]
}

const KEY = "pess:data"
export const ONLINE_WINDOW_MS = 90_000 // 1.5 minutes for Online

function id() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function defaultUserSettings(): UserSettings {
  return {
    theme: "system",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    dailyTargetMinutes: 8 * 60,
    notifications: {
      email: true,
      push: false,
      taskAssigned: true,
      taskDueSoon: true,
      projectUpdates: true,
    },
    privacy: {
      showEmailToMembers: true,
    },
    integrations: {
      calendarSync: false,
      github: false,
    },
    defaults: {
      landingPage: "dashboard",
      defaultPriority: "Medium",
    },
  }
}

function defaults(): Data {
  const users: User[] = [
    { id: id(), name: "Jane Doe", email: "jane@acme.org", role: "staff", lastActiveAt: new Date().toISOString() },
    {
      id: id(),
      name: "Michael Emelieze",
      email: "michael.emelieze@outdoors.ng",
      role: "admin",
      lastActiveAt: new Date().toISOString(),
    },
    { id: id(), name: "Moses Elimian", email: "elimian.moses@outdoors.ng", role: "admin" },
    { id: id(), name: "Salvation Alibor", email: "salvation.alibor@outdoors.ng", role: "admin" },
  ]

  const userSettings: Record<string, UserSettings> = users.reduce(
    (acc, u) => {
      acc[u.id] = defaultUserSettings()
      return acc
    },
    {} as Record<string, UserSettings>,
  )

  const org: OrgSettings = {
    name: "PESS Tracker Org",
    weekStart: "Monday",
    workdayMinutes: 8 * 60,
    workdays: [1, 2, 3, 4, 5],
    permissions: {
      createProject: ["admin", "manager"],
      createTask: ["admin", "manager", "staff"],
    },
    approvals: {
      requireForProject: true,
      requireForHighPriorityTasks: false,
    },
    notifications: {
      digest: "weekly",
    },
    security: {
      require2FA: false,
      allowPublicProjects: false,
      inviteDomain: undefined,
    },
    statuses: ["Planning", "In Progress", "Review", "Completed"],
  }

  // Seed one chat thread (Jane ↔ Michael) with a couple messages
  const jane = users.find((u) => u.email === "jane@acme.org")!
  const michael = users.find((u) => u.email === "michael.emelieze@outdoors.ng")!
  const threadId = id()
  const now = Date.now()
  const chats: ChatThread[] = [
    {
      id: threadId,
      participantIds: [jane.id, michael.id],
      createdAt: new Date(now - 1000 * 60 * 60).toISOString(),
      lastMessageAt: new Date(now - 1000 * 60 * 5).toISOString(),
    },
  ]
  const chatMessages: ChatMessage[] = [
    {
      id: id(),
      threadId,
      senderId: michael.id,
      text: "Welcome to PESS Tracker! Let me know if you need anything.",
      createdAt: new Date(now - 1000 * 60 * 40).toISOString(),
      readBy: [michael.id],
    },
    {
      id: id(),
      threadId,
      senderId: jane.id,
      text: "Thanks! I’ll start by logging my tasks.",
      createdAt: new Date(now - 1000 * 60 * 5).toISOString(),
      readBy: [jane.id],
    },
  ]

  return {
    users,
    userSettings,
    org,
    projects: [
      {
        id: id(),
        name: "Website Revamp",
        status: "In Progress",
        description: "Marketing site overhaul",
        createdAt: new Date().toISOString(),
      },
      {
        id: id(),
        name: "Grant 2025",
        status: "Planning",
        description: "Prepare application docs",
        createdAt: new Date().toISOString(),
      },
      {
        id: id(),
        name: "Mobile MVP",
        status: "Review",
        description: "QA and polish",
        createdAt: new Date().toISOString(),
      },
    ],
    tasks: [
      {
        id: id(),
        title: "Implement Upload Files",
        status: "In Progress",
        priority: "High",
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
        createdAt: new Date().toISOString(),
        assignee: "jane@acme.org",
        createdById: michael.id,
      },
      {
        id: id(),
        title: "Fix timeline labels",
        status: "Todo",
        priority: "Medium",
        dueDate: new Date(Date.now() + 86400000 * 4).toISOString(),
        createdAt: new Date().toISOString(),
        assignee: "jane@acme.org",
        createdById: jane.id,
      },
    ],
    notifications: [
      { id: id(), message: "You were assigned to 'API Integration'", createdAt: new Date().toISOString(), read: false },
      { id: id(), message: "Reminder: Daily log due 5:00 PM", createdAt: new Date().toISOString(), read: false },
    ],
    timeEntries: [],
    chats,
    chatMessages,
  }
}

export function load(): Data {
  if (typeof window === "undefined") return defaults()
  const raw = localStorage.getItem(KEY)
  try {
    return raw ? (JSON.parse(raw) as Data) : defaults()
  } catch {
    return defaults()
  }
}

export function save(next: Data) {
  localStorage.setItem(KEY, JSON.stringify(next))
  // In-tab event
  window.dispatchEvent(new Event("pess:data"))
  // Cross-tab event is handled by the browser storage event automatically
}

export function useData<T>(selector: (data: Data) => T): [T, (updater: (data: Data) => Data) => void] {
  const [state, setState] = React.useState(() => selector(load()))
  React.useEffect(() => {
    const updateFromStore = () => setState(selector(load()))
    // In-tab updates
    window.addEventListener("pess:data", updateFromStore)
    // Cross-tab realtime updates
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) updateFromStore()
    }
    window.addEventListener("storage", onStorage)
    return () => {
      window.removeEventListener("pess:data", updateFromStore)
      window.removeEventListener("storage", onStorage)
    }
  }, [selector])
  const update = (updater: (data: Data) => Data) => {
    const next = updater(load())
    save(next)
    setState(selector(next))
  }
  return [state, update]
}

// Helpers
function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"))
  return match ? decodeURIComponent(match[2]) : undefined
}

export function getCurrentUser(): User | undefined {
  if (typeof window === "undefined") return undefined
  const email = getCookie("pess_session")
  const d = load()
  return d.users.find((u) => u.email.toLowerCase() === (email || "").toLowerCase()) || d.users[0]
}

export function isOnline(user?: User): boolean {
  if (!user?.lastActiveAt) return false
  const ts = new Date(user.lastActiveAt).getTime()
  return Date.now() - ts < ONLINE_WINDOW_MS
}

/* API */
export const DataAPI = {
  // Projects
  addProject(input: Omit<Project, "id" | "createdAt">) {
    const d = load()
    const project: Project = { id: id(), createdAt: new Date().toISOString(), ...input }
    save({ ...d, projects: [project, ...d.projects] })
    return project
  },
  updateProject(idVal: string, patch: Partial<Project>) {
    const d = load()
    save({ ...d, projects: d.projects.map((p) => (p.id === idVal ? { ...p, ...patch } : p)) })
  },
  deleteProject(idVal: string) {
    const d = load()
    save({
      ...d,
      projects: d.projects.filter((p) => p.id !== idVal),
      tasks: d.tasks.filter((t) => t.projectId !== idVal),
    })
  },

  // Tasks
  addTask(input: Omit<Task, "id" | "createdAt">) {
    const d = load()
    const task: Task = { id: id(), createdAt: new Date().toISOString(), ...input }
    save({ ...d, tasks: [task, ...d.tasks] })
    return task
  },
  updateTask(idVal: string, patch: Partial<Task>) {
    const d = load()
    save({ ...d, tasks: d.tasks.map((t) => (t.id === idVal ? { ...t, ...patch } : t)) })
  },
  deleteTask(idVal: string) {
    const d = load()
    save({ ...d, tasks: d.tasks.filter((t) => t.id !== idVal) })
  },

  // Time
  addTimeEntry(input: Omit<TimeEntry, "id">) {
    const d = load()
    const entry: TimeEntry = { id: id(), ...input }
    save({ ...d, timeEntries: [entry, ...d.timeEntries] })
    return entry
  },

  // Notifications
  markNotification(idVal: string, read: boolean) {
    const d = load()
    save({ ...d, notifications: d.notifications.map((n) => (n.id === idVal ? { ...n, read } : n)) })
  },

  // Users
  addUser(input: Omit<User, "id">) {
    const d = load()
    const user: User = { id: id(), ...input }
    const settings = defaultUserSettings()
    save({ ...d, users: [user, ...d.users], userSettings: { ...d.userSettings, [user.id]: settings } })
    return user
  },
  updateUser(idVal: string, patch: Partial<User>) {
    const d = load()
    save({ ...d, users: d.users.map((u) => (u.id === idVal ? { ...u, ...patch } : u)) })
  },
  updateUserByEmail(email: string, patch: Partial<User>) {
    const d = load()
    save({
      ...d,
      users: d.users.map((u) => (u.email.toLowerCase() === email.toLowerCase() ? { ...u, ...patch } : u)),
    })
  },

  // Org/Settings
  updateOrg(patch: Partial<OrgSettings>) {
    const d = load()
    save({ ...d, org: { ...d.org, ...patch } })
  },
  setOrgStatuses(statuses: string[]) {
    const d = load()
    save({ ...d, org: { ...d.org, statuses } })
  },
  updateUserSettings(userId: string, patch: Partial<UserSettings>) {
    const d = load()
    const current = d.userSettings[userId] ?? defaultUserSettings()
    save({ ...d, userSettings: { ...d.userSettings, [userId]: { ...current, ...patch } } })
  },

  // Data controls
  resetDemo() {
    save(defaults())
  },
  exportJSON(): string {
    return JSON.stringify(load(), null, 2)
  },

  // Presence helpers
  presence: {
    ping(userId: string) {
      const d = load()
      const ts = new Date().toISOString()
      save({
        ...d,
        users: d.users.map((u) => (u.id === userId ? { ...u, lastActiveAt: ts } : u)),
      })
    },
    pingByEmail(email: string) {
      const d = load()
      const ts = new Date().toISOString()
      save({
        ...d,
        users: d.users.map((u) => (u.email.toLowerCase() === email.toLowerCase() ? { ...u, lastActiveAt: ts } : u)),
      })
    },
  },

  // Chat
  chat: {
    ensureThread(participantIds: string[], name?: string, chatType?: "individual" | "group" | "department") {
      const d = load()
      const set = new Set(participantIds)

      if (!name && (!chatType || chatType === "individual")) {
        const existing = d.chats.find(
          (t) => t.participantIds.length === set.size && t.participantIds.every((p) => set.has(p)) && !t.name,
        )
        if (existing) return existing
      }

      const t: ChatThread = {
        id: id(),
        participantIds: [...set],
        name: name?.trim() || undefined,
        chatType: chatType || (set.size > 2 ? "group" : "individual"),
        createdAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString(),
      }
      save({ ...d, chats: [t, ...d.chats] })
      return t
    },

    updateThread(threadId: string, updates: { name?: string; chatType?: "individual" | "group" | "department" }) {
      const d = load()
      save({
        ...d,
        chats: d.chats.map((c) => (c.id === threadId ? { ...c, ...updates, name: updates.name?.trim() || c.name } : c)),
      })
    },

    addParticipants(threadId: string, newParticipantIds: string[]) {
      const d = load()
      const thread = d.chats.find((c) => c.id === threadId)
      if (!thread) return

      const updatedParticipants = [...new Set([...thread.participantIds, ...newParticipantIds])]
      save({
        ...d,
        chats: d.chats.map((c) => (c.id === threadId ? { ...c, participantIds: updatedParticipants } : c)),
      })
    },

    removeParticipant(threadId: string, participantId: string) {
      const d = load()
      const thread = d.chats.find((c) => c.id === threadId)
      if (!thread || thread.participantIds.length <= 2) return // Don't allow removing from individual chats or if only 2 people left

      const updatedParticipants = thread.participantIds.filter((id) => id !== participantId)
      save({
        ...d,
        chats: d.chats.map((c) => (c.id === threadId ? { ...c, participantIds: updatedParticipants } : c)),
      })
    },

    sendMessage(threadId: string, senderId: string, text: string) {
      const trimmed = text.trim()
      if (!trimmed) return
      const d = load()
      const msg: ChatMessage = {
        id: id(),
        threadId,
        senderId,
        text: trimmed,
        createdAt: new Date().toISOString(),
        readBy: [senderId],
      }
      save({
        ...d,
        chatMessages: [...d.chatMessages, msg],
        chats: d.chats.map((c) => (c.id === threadId ? { ...c, lastMessageAt: msg.createdAt } : c)),
      })
      return msg
    },
    markRead(threadId: string, userId: string) {
      const d = load()
      const msgs = d.chatMessages.map((m) =>
        m.threadId === threadId && !m.readBy.includes(userId) ? { ...m, readBy: [...m.readBy, userId] } : m,
      )
      save({ ...d, chatMessages: msgs })
    },
  },
}

/* Typing indicator across tabs using storage events */
const TYPING_PREFIX = "pess:typing:"
export function setTyping(threadId: string, userId: string) {
  if (typeof window === "undefined") return
  const key = `${TYPING_PREFIX}${threadId}:${userId}`
  localStorage.setItem(key, String(Date.now()))
}
export function listenTyping(threadId: string, onTyping: (userId: string) => void): () => void {
  const handler = (e: StorageEvent) => {
    if (!e.key || !e.newValue) return
    if (!e.key.startsWith(TYPING_PREFIX)) return
    const [, idPart] = e.key.split(TYPING_PREFIX)
    const [tid, uid] = idPart.split(":")
    if (tid !== threadId) return
    const ts = Number(e.newValue || "0")
    if (Date.now() - ts < 3000) onTyping(uid)
  }
  window.addEventListener("storage", handler)
  return () => window.removeEventListener("storage", handler)
}
