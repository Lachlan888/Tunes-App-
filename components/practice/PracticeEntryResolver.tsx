"use client"

import { usePrivateSessionStorage } from "@/components/resilience/PrivateSessionProvider"
import FocusModeShell from "@/components/practice/FocusModeShell"
import {
  ACTIVE_PRACTICE_SESSION_KEY,
  getPracticeSessionHref,
  getResumablePracticeHref,
} from "@/lib/practice-session"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function PracticeEntryResolver({ today }: { today: string }) {
  const router = useRouter()
  const sessionStorage = usePrivateSessionStorage()

  useEffect(() => {
    const storedValue = sessionStorage.getItem(ACTIVE_PRACTICE_SESSION_KEY)
    const resumeHref = getResumablePracticeHref(storedValue, today)

    if (!resumeHref && storedValue) {
      sessionStorage.removeItem(ACTIVE_PRACTICE_SESSION_KEY)
    }

    router.replace(resumeHref ?? getPracticeSessionHref("due-today"))
  }, [router, sessionStorage, today])

  return (
    <FocusModeShell
      eyebrow="Practice"
      title="Focused Practice"
      detail="Loading today’s session…"
      exitHref="/"
    >
      <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-text-muted" role="status">
        Resuming active practice or preparing tunes due today.
      </p>
    </FocusModeShell>
  )
}
