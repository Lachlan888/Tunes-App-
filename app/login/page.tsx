"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type AuthMode = "login" | "signup" | "reset"

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  function resetMessages() {
    setMessage("")
    setErrorMessage("")
  }

  async function handleLogin() {
    resetMessages()
    setIsSubmitting(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setIsSubmitting(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    router.refresh()
    router.push("/")
  }

  async function handleSignup() {
    resetMessages()
    setIsSubmitting(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    setIsSubmitting(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    if (data.session) {
      router.refresh()
      router.push("/")
      return
    }

    setMessage("Account created. Check your email if confirmation is required, then sign in.")
    setMode("login")
  }

  async function handlePasswordReset() {
    resetMessages()
    setIsSubmitting(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    })

    setIsSubmitting(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setMessage(
      "If an account exists for that email, a password reset link has been sent."
    )
  }

  const isLogin = mode === "login"
  const isSignup = mode === "signup"
  const isReset = mode === "reset"

  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="mb-2 text-3xl font-bold">
        {isLogin && "Sign in"}
        {isSignup && "Create account"}
        {isReset && "Reset password"}
      </h1>

      <p className="mb-6 text-gray-600">
        {isLogin &&
          "Sign in to manage your tunes, lists, practice, and repertoire."}
        {isSignup &&
          "Create an account to start building your repertoire memory system."}
        {isReset &&
          "Enter your email and we’ll send you a link to set a new password."}
      </p>

      {message && (
        <div className="mb-4 rounded border border-green-600 bg-green-50 p-3 text-sm text-green-800">
          {message}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 rounded border border-red-600 bg-red-50 p-3 text-sm text-red-800">
          {errorMessage}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            className="w-full rounded border p-2"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            disabled={isSubmitting}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        {!isReset && (
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium"
            >
              Password
            </label>
            <input
              id="password"
              className="w-full rounded border p-2"
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              placeholder="Password"
              value={password}
              disabled={isSubmitting}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
        )}

        {isLogin && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleLogin}
            className="w-full rounded bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        )}

        {isSignup && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSignup}
            className="w-full rounded bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        )}

        {isReset && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handlePasswordReset}
            className="w-full rounded bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Sending reset link..." : "Send reset link"}
          </button>
        )}
      </div>

      <div className="mt-6 space-y-2 border-t pt-4 text-sm">
        {!isLogin && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              resetMessages()
              setMode("login")
            }}
            className="block underline disabled:cursor-not-allowed disabled:opacity-60"
          >
            Already have an account? Sign in
          </button>
        )}

        {!isSignup && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              resetMessages()
              setMode("signup")
            }}
            className="block underline disabled:cursor-not-allowed disabled:opacity-60"
          >
            New here? Create a new account
          </button>
        )}

        {!isReset && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              resetMessages()
              setMode("reset")
            }}
            className="block underline disabled:cursor-not-allowed disabled:opacity-60"
          >
            Forgot your password?
          </button>
        )}
      </div>
    </main>
  )
}