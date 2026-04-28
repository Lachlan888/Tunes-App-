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
    <main className="mx-auto max-w-md p-8">
      <h1 className="mb-2 text-3xl font-bold">Set new password</h1>
      <p className="mb-6 text-gray-600">
        Enter a new password for your Tunes App account.
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
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium"
          >
            New password
          </label>
          <input
            id="password"
            className="w-full rounded border p-2"
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
            className="w-full rounded border p-2"
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
          className="w-full rounded bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Updating password..." : "Update password"}
        </button>
      </div>
    </main>
  )
}