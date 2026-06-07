"use client"

import { useState, useTransition } from "react"
import { toggleActivityReactionFromClient } from "@/lib/actions/activity-interactions"

type OptimisticActivityReactionButtonProps = {
  activityEventId: number
  reactionType: string
  label: string
  initialIsActive: boolean
  initialCount: number
  redirectTo: string
}

export default function OptimisticActivityReactionButton({
  activityEventId,
  reactionType,
  label,
  initialIsActive,
  initialCount,
  redirectTo,
}: OptimisticActivityReactionButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [isActive, setIsActive] = useState(initialIsActive)
  const [count, setCount] = useState(initialCount)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  function handleClick() {
    if (isPending) return

    const nextIsActive = !isActive
    const nextCount = nextIsActive ? count + 1 : Math.max(count - 1, 0)

    setIsActive(nextIsActive)
    setCount(nextCount)
    setErrorMessage(null)

    startTransition(async () => {
      const result = await toggleActivityReactionFromClient({
        activityEventId,
        reactionType,
        redirectTo,
      })

      if (!result.ok) {
        setErrorMessage(result.message)
      }
    })
  }

  const buttonClassName = isActive
    ? "inline-flex items-center gap-2 rounded-full border border-primary bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-default"
    : "inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-default"

  const countClassName = isActive
    ? "rounded-full bg-background/20 px-2 py-0.5 text-[11px] font-bold leading-none text-primary-foreground"
    : "rounded-full border border-border bg-card px-2 py-0.5 text-[11px] font-bold leading-none text-foreground"

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        disabled={isPending}
        aria-disabled={isPending}
        aria-busy={isPending}
        aria-pressed={isActive}
        onClick={handleClick}
        className={buttonClassName}
      >
        <span>{label}</span>

        {count > 0 ? <span className={countClassName}>{count}</span> : null}
      </button>

      {errorMessage ? (
        <p className="text-xs font-medium text-destructive">
          Couldn’t sync reaction. It may update after refresh.
        </p>
      ) : null}
    </div>
  )
}
