"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { SESSION_COOKIE, safeEmail, isAdminEmail } from "@/lib/auth"
import { DataAPI } from "@/lib/data"

type AuthState = {
  error?: string
  message?: string
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

  try {
    const role = isAdminEmail(email) ? "admin" : "staff"
    DataAPI.addUser({
      name,
      email,
      role,
      lastActiveAt: new Date().toISOString(),
    })

    setSession(email)
  } catch (error) {
    console.error("Signup error:", error)
    return { error: "Failed to create account. Please try again." }
  }

  const role = isAdminEmail(email) ? "admin" : "staff"
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

  let userRole: string

  try {
    const data = JSON.parse(localStorage.getItem("pess:data") || "{}")
    const user = data.users?.find((u: any) => u.email.toLowerCase() === email.toLowerCase())

    if (!user) {
      return { error: "Invalid email or password" }
    }

    // Update user's last active timestamp
    DataAPI.updateUserByEmail(email, { lastActiveAt: new Date().toISOString() })

    setSession(email)
    userRole = user.role
  } catch (error) {
    console.error("Login error:", error)
    return { error: "Login failed. Please try again." }
  }

  if (userRole === "admin") {
    redirect("/admin")
  } else {
    redirect("/staff")
  }
}
