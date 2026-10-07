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
    ? "inline-flex min-h-11 items-center gap-2 rounded-control border border-state-social bg-state-social px-3 py-2 text-sm font-semibold text-state-social-foreground transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-default"
    : "inline-flex min-h-11 items-center gap-2 rounded-control border border-hairline px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-surface-note/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-default"

  const countClassName = isActive
    ? "text-xs font-bold leading-none text-state-social-foreground"
    : "text-xs font-bold leading-none text-foreground"

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
