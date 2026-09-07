"use client"

import { useState } from "react"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { joinClasses } from "@/components/ui/buttonStyles"
import { createClient } from "@/lib/supabase/client"

export default function LogoutButton({ className }: { className?: string }) {
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
  )
}
