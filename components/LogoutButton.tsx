"use client"

import { useState } from "react"
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
      className="underline disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? "Logging out..." : "Logout"}
    </button>
  )
}