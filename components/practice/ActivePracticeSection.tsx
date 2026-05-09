import Link from "next/link"
import PracticeProgress from "@/components/practice/PracticeProgress"
import RemoveFromPracticeButton from "@/components/practice/RemoveFromPracticeButton"
import { buttonStyles } from "@/components/ui/buttonStyles"
import { APP_TIME_ZONE } from "@/lib/review"
import type { ReviewQueueItem } from "@/lib/loaders/review"

type ActivePracticeSectionProps = {
  practiceItems: ReviewQueueItem[]
  redirectTo: string
}

function formatDueDate(dateValue: string | null) {
  if (!dateValue) return "No due date"

  return new Date(dateValue).toLocaleDateString("en-AU", {
    timeZone: APP_TIME_ZONE,
  })
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

export default function ActivePracticeSection({
  practiceItems,
  redirectTo,
}: ActivePracticeSectionProps) {
  return (
    <section className="mt-10 rounded-3xl border border-border bg-card p-6 shadow-sm">
      <details>
        <summary className="cursor-pointer text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Currently in practice ({practiceItems.length})
        </summary>

        <p className="mt-3 text-sm text-muted-foreground">
          Full list of tunes currently in your practice system.
        </p>

        {practiceItems.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
            No tunes in practice yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {practiceItems.map((userPiece) => {
              const badgeLabel =
                userPiece.backlog_label ??
                (userPiece.due_date_only ? "Scheduled" : "No due date")

              const badgeClassName = userPiece.backlog_label
                ? getStatusBadgeClasses(userPiece.backlog_label)
                : badgeLabel === "Scheduled"
                  ? "border border-border bg-muted text-muted-foreground"
                  : "border border-border bg-background/70 text-muted-foreground"

              return (
                <li
                  key={userPiece.id}
                  className="rounded-2xl border border-border bg-background/70 p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {userPiece.piece ? (
                          <Link
                            href={`/library/${userPiece.piece.id}`}
                            className="decoration-primary decoration-2 underline-offset-4 hover:underline"
                          >
                            {userPiece.piece.title}
                          </Link>
                        ) : (
                          "Untitled piece"
                        )}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Key: {userPiece.piece?.key ?? "Unknown"} | Style:{" "}
                        {userPiece.piece?.style ?? "Unknown"} | Time:{" "}
                        {userPiece.piece?.time_signature ?? "Unknown"}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Due: {formatDueDate(userPiece.next_review_due)}
                      </p>

                      <PracticeProgress
                        stage={userPiece.stage}
                        className="mt-3 max-w-sm"
                      />

                      <div className="mt-3">
                        <RemoveFromPracticeButton
                          userPieceId={userPiece.id}
                          redirectTo={redirectTo}
                          label="Remove from practice"
                          pendingLabel="Removing..."
                          className={buttonStyles.destructiveSecondary}
                        />
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClassName}`}
                    >
                      {badgeLabel}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </details>
    </section>
  )
}