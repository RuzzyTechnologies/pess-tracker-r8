"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { SESSION_COOKIE, safeEmail } from "@/lib/auth"

type AuthState = {
  error?: string
  message?: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

function setSession(email: string, token: string) {
  const cookieStore = cookies()
  // Set session cookie with email
  cookieStore.set(SESSION_COOKIE, email, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  // Set auth token cookie
  cookieStore.set("auth_token", token, {
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
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        firstName: name.split(" ")[0] || name,
        lastName: name.split(" ").slice(1).join(" ") || "",
        confirmPassword: password,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { error: data.error || "Failed to create account" }
    }

    setSession(email, data.token)

    // Redirect based on user role from backend response
    if (data.user.role === "admin") {
      redirect("/admin")
    } else {
      redirect("/staff")
    }
  } catch (error) {
    console.error("Signup error:", error)
    return { error: "Network error. Please try again." }
  }
}

export async function loginAction(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = safeEmail(formData.get("email"))
  const password = String(formData.get("password") || "")

  if (!email || !password) {
    return { error: "Email and password are required." }
  }

  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { error: data.error || "Invalid email or password" }
    }

    setSession(email, data.token)

    // Redirect based on user role from backend response
    if (data.user.role === "admin") {
      redirect("/admin")
    } else {
      redirect("/staff")
    }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "Network error. Please try again." }
  }
}
