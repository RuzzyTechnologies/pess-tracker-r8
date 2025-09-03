import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { SESSION_COOKIE } from "@/lib/auth"
import { AuthForm } from "@/components/auth/auth-form"
import { loginAction } from "./(auth)/actions"

export default function Page() {
  const cookieStore = cookies()
  const session = cookieStore.get(SESSION_COOKIE)?.value

  if (session) {
    try {
      const userData = JSON.parse(session)
      if (userData.role === "admin") {
        redirect("/admin")
      } else {
        redirect("/staff")
      }
    } catch {
      // If session is invalid, show login page
    }
  }

  return <AuthForm variant="login" onLogin={loginAction} />
}
