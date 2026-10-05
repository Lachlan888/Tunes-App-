"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { usePrivateSessionStorage } from "@/components/resilience/PrivateSessionProvider"
import { ACTIVE_PRACTICE_SESSION_KEY, getResumablePracticeHref } from "@/lib/practice-session"
import Icon from "@/components/ui/Icon"

export default function PracticeEntryResolver({ today, readyCount, activeCount }: {
  today: string
  readyCount: number
  activeCount: number
}) {
  const router = useRouter()
  const storage = usePrivateSessionStorage()
  const [resumeHref, setResumeHref] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    const stored = storage.getItem(ACTIVE_PRACTICE_SESSION_KEY)
    const href = getResumablePracticeHref(stored, today)
    // Account-scoped session state is only available after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResumeHref(href)
    if (stored && !href) storage.removeItem(ACTIVE_PRACTICE_SESSION_KEY)
  }, [storage, today])

  function start() {
    setStarting(true)
    router.push(resumeHref ?? `/review?session=ready&run=${crypto.randomUUID()}`)
  }

  const available = readyCount > 0 || Boolean(resumeHref)
  return (
    <section className="practice-entry" aria-labelledby="practice-entry-title">
      <div className="practice-entry-symbol" aria-hidden="true"><Icon name={available ? "practice" : "check"} size={30} /></div>
      <h1 id="practice-entry-title" className="font-sans text-5xl font-bold tracking-tight sm:text-6xl">{available ? "Practice" : activeCount > 0 ? "All caught up" : "Your practice starts here"}</h1>
      <p className="mt-4 text-base leading-7 text-text-muted sm:text-lg">
        {resumeHref ? "Pick up where you left off." : readyCount > 0 ? `${readyCount} tune${readyCount === 1 ? "" : "s"} ready. One at a time.` : activeCount > 0 ? "Your next tunes will be here when they’re due." : "Add tunes to Practice and we’ll take care of what’s next."}
      </p>
      {available ? (
        <button type="button" onClick={start} disabled={starting} className="practice-start-button">
          <svg aria-hidden="true" width="17" height="19" viewBox="0 0 17 19" fill="currentColor"><path d="M2 1.5a1 1 0 0 0-1.5.86v14.28a1 1 0 0 0 1.5.86l12.3-7.14a1 1 0 0 0 0-1.72L2 1.5Z" /></svg>
          {starting ? "Opening practice…" : resumeHref ? "Resume practice" : "Start practice"}
        </button>
      ) : activeCount === 0 ? <Link href="/library" className="practice-start-button">Find tunes</Link> : <Link href="/" className="mt-8 inline-flex min-h-11 items-center text-sm font-semibold text-state-practice underline underline-offset-4">Back home</Link>}
    </section>
  )
}
