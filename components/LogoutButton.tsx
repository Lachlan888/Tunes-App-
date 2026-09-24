"use client"

import { purgeTunesSessionStorage } from "@/lib/browser-storage"
import { useState } from "react"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { joinClasses } from "@/components/ui/buttonStyles"
import { createClient } from "@/lib/supabase/client"

export default function LogoutButton({ className }: { className?: string }) {
  const [isPending, setIsPending] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const supabase = createClient()

  async function handleLogout() {
    if (isPending) return

    setIsPending(true)

    setErrorMessage("")
    try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      setIsPending(false)
      setErrorMessage("Could not sign out. Please try again.")
      return
    }

    purgeTunesSessionStorage()
    window.location.href = "/login"
    } catch {
      setIsPending(false)
      setErrorMessage("Connection problem. Please try again.")
    }
  }

  return (
    <span>
    <button
      type="button"
      disabled={isPending}
      onClick={handleLogout}
      className={joinClasses(
        "rounded-control border border-hairline px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-surface-note hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
    >
      {isPending ? (
        <span className="inline-flex items-center justify-center gap-2">
          <LoadingSpinner label="Logging out..." size="sm" decorative />
          <span>Logging out...</span>
        </span>
      ) : (
        "Logout"
      )}
    </button>
    {errorMessage && <span role="alert" className="mt-2 block text-sm text-destructive">{errorMessage}</span>}
    </span>
  )
}
