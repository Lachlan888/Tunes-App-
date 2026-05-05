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

    const previousIsActive = isActive
    const previousCount = count

    const nextIsActive = !previousIsActive
    const nextCount = nextIsActive
      ? previousCount + 1
      : Math.max(previousCount - 1, 0)

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
        setIsActive(previousIsActive)
        setCount(previousCount)
        setErrorMessage(result.message)
      }
    })
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        disabled={isPending}
        aria-disabled={isPending}
        aria-busy={isPending}
        onClick={handleClick}
        className={
          isActive
            ? "rounded-full border border-primary bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-default"
            : "rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-default"
        }
      >
        {`${label}${count > 0 ? ` ${count}` : ""}`}
      </button>

      {errorMessage ? (
        <p className="text-xs font-medium text-destructive">{errorMessage}</p>
      ) : null}
    </div>
  )
}