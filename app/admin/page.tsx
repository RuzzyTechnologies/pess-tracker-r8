import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { SESSION_COOKIE, isAdminEmail } from "@/lib/auth"
import PessTracker from "../../pess-tracker"

export default function AdminPage() {
  const cookieStore = cookies()
  const email = cookieStore.get(SESSION_COOKIE)?.value

  if (!email) {
    redirect("/login")
  }
  if (!isAdminEmail(email)) {
    redirect("/staff")
  }

  return <PessTracker />
}
