import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { SESSION_COOKIE, isAdminEmail } from "@/lib/auth"
import PessTracker from "../../pess-tracker"

export default function StaffPage() {
  const cookieStore = cookies()
  const email = cookieStore.get(SESSION_COOKIE)?.value

  if (!email) {
    redirect("/login")
  }
  // If an admin hits /staff, push them to /admin
  if (isAdminEmail(email)) {
    redirect("/admin")
  }

  return <PessTracker />
}
