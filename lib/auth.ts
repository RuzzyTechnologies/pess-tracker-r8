export const SESSION_COOKIE = "pess_session"

export function safeEmail(value: unknown): string {
  if (typeof value === "string") return value.trim().toLowerCase()
  return ""
}

// Admin allowlist
export const ADMIN_EMAILS = new Set<string>([
  "michael.emelieze@outdoors.ng",
  "elimian.moses@outdoors.ng",
  "salvation.alibor@outdoors.ng",
])

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false
  return ADMIN_EMAILS.has(email.toLowerCase())
}
