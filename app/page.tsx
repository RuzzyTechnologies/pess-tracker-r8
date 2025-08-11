import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { SESSION_COOKIE } from "@/lib/auth"
import PessTracker from "../pess-tracker"

export default function Page() {
  const cookieStore = cookies()
  const session = cookieStore.get(SESSION_COOKIE)?.value

  if (!session) {
    redirect("/login")
  }

  return <PessTracker />
}
