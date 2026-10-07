"use client"

import Link from "next/link"
import { useState } from "react"
import FocusModeShell from "@/components/practice/FocusModeShell"
import { getPracticeReflectionHref } from "@/lib/practice-session"
import { buttonStyles } from "@/components/ui/buttonStyles"

export default function PracticeSessionSummary({ count, remainingCount, sessionDate, practiceDiaryEnabled, onDone }: {
  count: number; remainingCount: number; sessionDate: string; practiceDiaryEnabled: boolean; onDone: () => void
}) {
  const [diaryDismissed, setDiaryDismissed] = useState(false)
  return (
    <FocusModeShell eyebrow="" title="Practice" detail="" showExit={false}>
      <section className="practice-finish">
        <h1 className="font-sans text-4xl font-bold tracking-tight sm:text-5xl">{count > 0 ? `${count} tune${count === 1 ? "" : "s"} practised` : remainingCount > 0 ? "Ready when you are" : "All caught up"}</h1>
        {count > 0 ? <p className="mt-4 text-base leading-7 text-text-muted">Your reviews are saved.</p> : null}
        <Link href="/review" onClick={onDone} className="practice-start-button">Done</Link>
        {practiceDiaryEnabled && count > 0 && !diaryDismissed ? (
          <div className="mt-10 w-full max-w-md border-t border-hairline pt-6">
            <p className="text-sm text-text-muted">Anything you’d like to remember?</p>
            <div className="mt-2 flex flex-wrap items-center justify-start gap-x-5">
              <Link href={getPracticeReflectionHref(sessionDate, "/review")} onClick={onDone} className={buttonStyles.text}>Add a diary entry</Link>
              <button type="button" className="min-h-11 text-sm text-text-muted" onClick={() => setDiaryDismissed(true)}>Not now</button>
            </div>
          </div>
        ) : null}
      </section>
    </FocusModeShell>
  )
}
