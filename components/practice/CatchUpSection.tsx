import PracticeReviewCard from "@/components/practice/PracticeReviewCard"
import type { ReviewQueueItem } from "@/lib/loaders/review"
import type { BacklogGroupSummary } from "@/lib/types"

type CatchUpSectionProps = {
  catchUpQueue: ReviewQueueItem[]
  backlogSummary: BacklogGroupSummary[]
  redirectTo: string
  defaultOpen?: boolean
}

function getStatusBadgeClasses(label: string | null) {
  switch (label) {
    case "Due now":
      return "border border-warning bg-warning/30 text-warning-foreground"
    case "Overdue":
      return "border border-destructive/40 bg-destructive/15 text-destructive"
    case "Overdue (longest)":
      return "border border-destructive bg-destructive/20 text-destructive"
    default:
      return "border border-border bg-muted text-muted-foreground"
  }
}

export default function CatchUpSection({
  catchUpQueue,
  backlogSummary,
  redirectTo,
  defaultOpen = false,
}: CatchUpSectionProps) {
  return (
    <section
      id="catch-up"
      className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm"
    >
      <details open={defaultOpen}>
        <summary className="cursor-pointer text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Catch up ({catchUpQueue.length})
        </summary>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Catch up on overdue tunes.
        </p>

        {catchUpQueue.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
            Nothing overdue right now.
          </p>
        ) : (
          <>
            <ul className="mt-5 grid gap-3 md:grid-cols-3">
              {backlogSummary.map((group) => (
                <li
                  key={group.tier}
                  className="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-3"
                >
                  <span className="text-sm font-semibold text-foreground">
                    {group.label}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    {group.count}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {catchUpQueue.map((userPiece) => (
                <PracticeReviewCard
                  key={userPiece.id}
                  userPiece={userPiece}
                  redirectTo={redirectTo}
                  badgeLabel={userPiece.backlog_label ?? "Overdue"}
                  badgeClassName={getStatusBadgeClasses(
                    userPiece.backlog_label
                  )}
                />
              ))}
            </div>
          </>
        )}
      </details>
    </section>
  )
}