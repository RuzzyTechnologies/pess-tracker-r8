import { AuthForm } from "@/components/auth/auth-form"
import { loginAction } from "../actions"

export default function LoginPage() {
  return <AuthForm variant="login" onLogin={loginAction} />
}
