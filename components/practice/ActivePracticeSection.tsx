import Link from "next/link"
import PracticeProgress from "@/components/practice/PracticeProgress"
import RemoveFromPracticeButton from "@/components/practice/RemoveFromPracticeButton"
import TuneMediaLauncher from "@/components/reference-media/TuneMediaLauncher"
import { buttonStyles } from "@/components/ui/buttonStyles"
import { cardStyles } from "@/components/ui/cardStyles"
import type { ReviewQueueItem } from "@/lib/loaders/review"

type ActivePracticeSectionProps = {
  totalCount: number
  practiceItems: ReviewQueueItem[]
  redirectTo: string
}

export default function ActivePracticeSection({
  practiceItems,
  totalCount,
  redirectTo,
}: ActivePracticeSectionProps) {
  return (
    <section className="mt-10 border-t border-hairline pt-5">
      <details>
        <summary className="cursor-pointer text-xl font-bold tracking-tight text-foreground">
          Currently in practice ({totalCount})
        </summary>

        <p className="mt-3 text-sm text-muted-foreground">Next 20 scheduled tunes</p>

        <Link href="/library/practice" className={buttonStyles.text}>Browse all Practice tunes</Link>

        {practiceItems.length === 0 ? (
          <p className="mt-4 border-b border-hairline py-4 text-sm text-muted-foreground">
            No tunes in practice yet.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-hairline border-t border-hairline">
            {practiceItems.slice(0, 20).map((userPiece) => {
              const badgeLabel =
                userPiece.overdue_days > 0
                  ? "Overdue"
                  : userPiece.due_date_only
                    ? "Scheduled"
                    : "No due date"

              const badgeClassName =
                userPiece.overdue_days > 0
                  ? "border border-destructive/40 bg-destructive/15 text-destructive"
                : badgeLabel === "Scheduled"
                  ? "border border-border bg-muted text-muted-foreground"
                  : "border border-border bg-background/70 text-muted-foreground"

              return (
                <li
                  key={userPiece.id}
                  className={cardStyles.mobileRowToCard}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
                    <div className="min-w-0 flex-1">
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

                      <PracticeProgress
                        stage={userPiece.stage}
                        nextReviewDue={userPiece.next_review_due}
                        className="mt-3 max-w-sm"
                      />

                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        {userPiece.piece &&
                        userPiece.media_bundle.effectiveReference ? (
                          <TuneMediaLauncher
                            pieceId={userPiece.piece.id}
                            title={userPiece.piece.title}
                            mediaBundle={userPiece.media_bundle}
                            redirectTo={redirectTo}
                            label="Open Reference Media"
                            className={buttonStyles.secondary}
                          />
                        ) : null}

                        <RemoveFromPracticeButton
                          userPieceId={userPiece.id}
                          redirectTo={redirectTo}
                          className={buttonStyles.destructiveSecondary}
                        />
                      </div>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${badgeClassName}`}
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
