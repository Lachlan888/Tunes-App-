import type { BadgeAward, BadgeProgressSummary as BadgeProgress } from "@/lib/types"

type BadgeProgressSummaryProps = {
  viewerAward: BadgeAward | null
  progress: BadgeProgress | null
}

export default function BadgeProgressSummary({
  viewerAward,
  progress,
}: BadgeProgressSummaryProps) {
  if (viewerAward) {
    return (
      <div className="rounded-2xl border border-success bg-background/70 p-4">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Your status
        </p>
        <p className="mt-3 text-sm font-medium text-foreground">
          Awarded on{" "}
          {new Intl.DateTimeFormat("en-AU", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }).format(new Date(viewerAward.awarded_at))}
        </p>
      </div>
    )
  }

  if (!progress) {
    return (
      <div className="rounded-2xl border border-border bg-background/70 p-4">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Your status
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Log in to see your progress.
        </p>
      </div>
    )
  }

  const percentage =
    progress.required > 0
      ? Math.min(100, Math.round((progress.current / progress.required) * 100))
      : 0

  return (
    <div className="rounded-2xl border border-border bg-background/70 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Your status
          </p>
          <p className="mt-3 text-sm font-medium text-foreground">
            {progress.isEligible ? "Eligible" : "In progress"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{progress.label}</p>
        </div>

        <p className="rounded-full border border-border bg-card px-3 py-1 text-sm font-medium text-foreground">
          {progress.current} / {progress.required}
        </p>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {!progress.isCalculable ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Some parts of this badge can’t be checked automatically yet.
        </p>
      ) : null}
    </div>
  )
}
