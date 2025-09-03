"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { SESSION_COOKIE, safeEmail } from "@/lib/auth"

type AuthState = {
  error?: string
  message?: string
}

const tempUsers = new Map<string, { name: string; email: string; password: string; role: string }>()

const ALLOWED_DOMAINS = [
  "@outdoors.ng",
  "@xpark360.com",
  "@pdma.io",
  "@ess.com.ng",
  "@premiumdigitalmarketing.ng",
  "@essdigital.ng",
]

const ADMIN_EMAIL_PREFIXES = ["elimian.moses", "michael.emelieze", "salvation.alibor"]

function isAllowedEmail(email: string): boolean {
  return ALLOWED_DOMAINS.some((domain) => email.toLowerCase().endsWith(domain.toLowerCase()))
}

function getUserRole(email: string): string {
  const emailLower = email.toLowerCase()
  const hasAdminPrefix = ADMIN_EMAIL_PREFIXES.some((prefix) => emailLower.startsWith(prefix.toLowerCase()))
  return hasAdminPrefix ? "admin" : "staff"
}

function setSession(email: string) {
  const cookieStore = cookies()
  cookieStore.set(SESSION_COOKIE, email, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
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

  if (!isAllowedEmail(email)) {
    return { error: "Access denied. Please use an authorized email domain." }
  }

  if (tempUsers.has(email.toLowerCase())) {
    return { error: "An account with this email already exists." }
  }

  try {
    const role = getUserRole(email)

    tempUsers.set(email.toLowerCase(), {
      name,
      email,
      password, // In production, this should be hashed
      role,
    })

    setSession(email)
  } catch (error) {
    console.error("Signup error:", error)
    return { error: "Failed to create account. Please try again." }
  }

  const role = getUserRole(email)
  if (role === "admin") {
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

  if (!isAllowedEmail(email)) {
    return { error: "Access denied. Please use an authorized email domain." }
  }

  try {
    const user = tempUsers.get(email.toLowerCase())

    if (!user || user.password !== password) {
      return { error: "Invalid email or password" }
    }

    setSession(email)

    if (user.role === "admin") {
      redirect("/admin")
    } else {
      redirect("/staff")
    }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "Login failed. Please try again." }
  }
}
