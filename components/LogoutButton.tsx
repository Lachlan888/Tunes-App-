"use client"

import { useState } from "react"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { createClient } from "@/lib/supabase/client"

export default function LogoutButton() {
  const [isPending, setIsPending] = useState(false)
  const supabase = createClient()

  async function handleLogout() {
    if (isPending) return

    setIsPending(true)

    const { error } = await supabase.auth.signOut()

    if (error) {
      setIsPending(false)
      return
    }

    window.location.href = "/login"
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleLogout}
      className="rounded-full border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"
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
  )
}
