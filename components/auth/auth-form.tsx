"use client"

import * as React from "react"
import { useActionState } from "react"
import Link from "next/link"
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { signupAction as SignupFn, loginAction as LoginFn } from "@/app/(auth)/actions"

type Variant = "login" | "signup"

type AuthFormProps = {
  variant?: Variant
  onLogin?: typeof LoginFn
  onSignup?: typeof SignupFn
}

export function AuthForm({ variant = "login", onLogin, onSignup }: AuthFormProps) {
  const [showPassword, setShowPassword] = React.useState(false)

  const initialState = { error: undefined as string | undefined }
  const [loginState, loginAction, loginPending] = useActionState(onLogin ?? (async () => initialState), initialState)
  const [signupState, signupAction, signupPending] = useActionState(
    onSignup ?? (async () => initialState),
    initialState,
  )

  const isSignup = variant === "signup"
  const isPending = loginPending || signupPending
  const state = isSignup ? signupState : loginState
  const action = isSignup ? signupAction : loginAction

  return (
    <div>
      <Card className="backdrop-blur supports-[backdrop-filter]:bg-white/75 dark:supports-[backdrop-filter]:bg-slate-900/75 w-full max-w-md border border-sky-100/70 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {isSignup ? "Create your account" : "Welcome back"}
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">
            {isSignup ? "Sign up to start tracking your projects and tasks." : "Log in to continue to PESS Tracker."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-5">
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <div className="relative">
                  <Input
                    id="name"
                    name="name"
                    placeholder="Jane Doe"
                    required
                    className="pl-9 border-sky-100 dark:border-slate-700 focus-visible:ring-sky-400/40"
                  />
                  <User className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  required
                  autoComplete="email"
                  className="pl-9 border-sky-100 dark:border-slate-700 focus-visible:ring-sky-400/40"
                />
                <Mail className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={isSignup ? "At least 6 characters" : "Your password"}
                  required
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  className="pr-10 pl-9 border-sky-100 dark:border-slate-700 focus-visible:ring-sky-400/40"
                />
                <Lock className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {state?.error && (
              <div
                role="alert"
                className="rounded-md border border-red-200 dark:border-red-800 bg-red-50/70 dark:bg-red-950/70 px-3 py-2 text-sm text-red-700 dark:text-red-400"
              >
                {state.error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-sky-600 text-white hover:bg-sky-700 transition-transform active:scale-[0.98]"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignup ? "Creating account..." : "Signing in..."}
                </>
              ) : isSignup ? (
                "Create account"
              ) : (
                "Sign in"
              )}
            </Button>

            <div className="text-center text-sm text-slate-600 dark:text-slate-400">
              {isSignup ? (
                <>
                  Already have an account?{" "}
                  <Link
                    className="font-medium text-sky-700 dark:text-sky-400 underline-offset-4 hover:underline"
                    href="/login"
                  >
                    Sign in
                  </Link>
                </>
              ) : (
                <>
                  New here?{" "}
                  <Link
                    className="font-medium text-sky-700 dark:text-sky-400 underline-offset-4 hover:underline"
                    href="/signup"
                  >
                    Create an account
                  </Link>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
