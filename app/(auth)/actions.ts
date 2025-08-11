"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { SESSION_COOKIE, safeEmail, isAdminEmail } from "@/lib/auth"

// Demo in-memory user store (stub). Replace with Postgres/NextAuth in production.
const users = new Map<string, { name: string; password: string }>()

type AuthState = {
  error?: string
  message?: string
}

function setSession(email: string) {
  const cookieStore = cookies()
  // Demo cookie for 7 days
  cookieStore.set(SESSION_COOKIE, email, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function signupAction(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") || "").trim()
  const email = safeEmail(formData.get("email"))
  const password = String(formData.get("password") || "")

  if (!name || !email || !password) {
    return { error: "Please fill out all fields." }
  }
  if (!email.includes("@")) {
    return { error: "Please enter a valid email address." }
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." }
  }
  if (users.has(email)) {
    return { error: "An account with this email already exists." }
  }

  users.set(email, { name, password })
  setSession(email)

  // Redirect based on email allowlist
  if (isAdminEmail(email)) {
    redirect("/admin")
  } else {
    redirect("/staff")
  }
}

export async function loginAction(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = safeEmail(formData.get("email"))
  const password = String(formData.get("password") || "")

  if (!email || !password) {
    return { error: "Email and password are required." }
  }
  const user = users.get(email)
  if (!user || user.password !== password) {
    return { error: "Invalid email or password." }
  }

  setSession(email)

  // Redirect based on email allowlist
  if (isAdminEmail(email)) {
    redirect("/admin")
  } else {
    redirect("/staff")
  }
}
