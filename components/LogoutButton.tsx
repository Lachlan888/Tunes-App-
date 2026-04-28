"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function LogoutButton() {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    setIsPending(true)

    await supabase.auth.signOut()

    router.refresh()
    router.push("/login")
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