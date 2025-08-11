import { AuthForm } from "@/components/auth/auth-form"
import { signupAction } from "../actions"

export default function SignupPage() {
  return <AuthForm variant="signup" onSignup={signupAction} />
}
