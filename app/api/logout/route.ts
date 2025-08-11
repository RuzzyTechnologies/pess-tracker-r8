import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { SESSION_COOKIE } from "@/lib/auth"

export async function POST() {
  const cookieStore = cookies()
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  })
  return NextResponse.json({ ok: true })
}
