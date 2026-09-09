"use client"

import Link from "next/link"
import { useLayoutEffect, type ReactNode } from "react"
import { buttonStyles } from "@/components/ui/buttonStyles"

export default function FocusModeShell({
  eyebrow,
  title,
  detail,
  onEnd,
  endDisabled = false,
  children,
}: {
  eyebrow: string
  title: string
  detail: string
  onEnd?: () => void
  endDisabled?: boolean
  children: ReactNode
}) {
  useLayoutEffect(() => {
    document.documentElement.dataset.focusMode = "practice"
    return () => {
      delete document.documentElement.dataset.focusMode
    }
  }, [])

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-4 text-text-primary sm:px-6 md:py-6">
      <header className="flex items-center justify-between gap-4 border-b border-hairline pb-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
            {eyebrow}
          </p>
          <h1 className="truncate font-serif text-xl font-bold sm:text-2xl">{title}</h1>
          <p className="mt-1 text-sm text-text-muted">{detail}</p>
        </div>
        {onEnd ? (
          <button
            type="button"
            onClick={onEnd}
            disabled={endDisabled}
            className={`${buttonStyles.secondary} !w-auto shrink-0`}
          >
            End session
          </button>
        ) : (
          <Link href="/review" className={`${buttonStyles.secondary} !w-auto shrink-0`}>
            Exit
          </Link>
        )}
      </header>
      {children}
    </main>
  )
}
