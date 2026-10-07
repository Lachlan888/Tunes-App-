"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  async function handleUpdatePassword() {
    setMessage("")
    setErrorMessage("")

    if (!password) {
      setErrorMessage("Enter a new password.")
      return
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.")
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.")
      return
    }

    setIsSubmitting(true)

    const { error } = await supabase.auth.updateUser({
      password,
    })

    setIsSubmitting(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setMessage("Password updated. Redirecting to Home...")

    window.setTimeout(() => {
      router.refresh()
      router.push("/")
    }, 800)
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-6 text-text-primary sm:px-6 lg:py-10">
      <section className="border-t border-hairline py-6 sm:py-8">
        <h1 className="font-sans text-4xl font-bold tracking-tight">Set new password</h1>

        {message && (
          <div role="status" className="mb-4 border-l-4 border-state-known py-2 pl-3 text-sm text-state-known">
            {message}
          </div>
        )}

        {errorMessage && (
          <div role="alert" className="mb-4 border-l-4 border-action-destructive py-2 pl-3 text-sm text-action-destructive">
            {errorMessage}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium"
            >
              New password
            </label>
            <input
              id="password"
              className="min-h-11 w-full rounded-control border border-hairline bg-surface-paper px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              type="password"
              autoComplete="new-password"
              value={password}
              disabled={isSubmitting}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="mb-1 block text-sm font-medium"
            >
              Confirm new password
            </label>
            <input
              id="confirm-password"
              className="min-h-11 w-full rounded-control border border-hairline bg-surface-paper px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              disabled={isSubmitting}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleUpdatePassword}
            className="min-h-11 w-full rounded-control bg-action-primary px-4 py-2 font-semibold text-action-primary-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Updating password..." : "Update password"}
          </button>
        </div>
      </section>
    </main>
  )
}
