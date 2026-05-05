import Link from "next/link"
import PracticeProgress from "@/components/practice/PracticeProgress"
import ReferenceMediaLink from "@/components/ReferenceMediaLink"
import RemoveFromPracticeButton from "@/components/practice/RemoveFromPracticeButton"
import SubmitButton from "@/components/SubmitButton"
import { markFailed, markShaky, markSolid } from "@/lib/actions/reviews"
import { APP_TIME_ZONE } from "@/lib/review"
import type { ReviewQueueItem } from "@/lib/loaders/review"

type PracticeReviewCardProps = {
  userPiece: ReviewQueueItem
  redirectTo: string
  badgeLabel: string
  badgeClassName: string
}

function formatDueDate(dateValue: string | null) {
  if (!dateValue) return "No due date"

  return new Date(dateValue).toLocaleDateString("en-AU", {
    timeZone: APP_TIME_ZONE,
  })
}

const reviewButtonBase =
  "rounded-full border px-4 py-2 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"

export default function PracticeReviewCard({
  userPiece,
  redirectTo,
  badgeLabel,
  badgeClassName,
}: PracticeReviewCardProps) {
  const title = userPiece.piece?.title ?? "Untitled piece"

  return (
    <article className="rounded-2xl border border-border bg-background/70 p-5 shadow-sm transition hover:bg-muted/70">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="font-serif text-3xl font-bold leading-tight tracking-tight text-foreground">
            {userPiece.piece ? (
              <Link
                href={`/library/${userPiece.piece.id}`}
                className="decoration-primary decoration-2 underline-offset-4 hover:underline"
              >
                {title}
              </Link>
            ) : (
              title
            )}
          </h2>

          <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">
            Key: {userPiece.piece?.key ?? "Unknown"}{" "}
            <span aria-hidden="true">|</span> Style:{" "}
            {userPiece.piece?.style ?? "Unknown"}{" "}
            <span aria-hidden="true">|</span> Time:{" "}
            {userPiece.piece?.time_signature ?? "Unknown"}{" "}
            <span aria-hidden="true">|</span> Due:{" "}
            {formatDueDate(userPiece.next_review_due)}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${badgeClassName}`}
        >
          {badgeLabel}
        </span>
      </div>

      {userPiece.piece?.reference_url && userPiece.piece?.title && (
        <div className="mt-4 w-full">
          <ReferenceMediaLink
            referenceUrl={userPiece.piece.reference_url}
            title={userPiece.piece.title}
            className="text-sm font-medium text-muted-foreground underline underline-offset-4 transition hover:text-foreground"
          />
        </div>
      )}

      <PracticeProgress stage={userPiece.stage} className="mt-5" />

      <div className="mt-6 flex flex-wrap gap-3">
        <form action={markFailed}>
          <input type="hidden" name="userPieceId" value={userPiece.id} />
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <SubmitButton
            label="Rough"
            pendingLabel="Saving..."
            className={`${reviewButtonBase} border-[#b98576] bg-[#f2dfd6] text-[#6f3f36] hover:bg-[#ead0c5]`}
          />
        </form>

        <form action={markShaky}>
          <input type="hidden" name="userPieceId" value={userPiece.id} />
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <SubmitButton
            label="Shaky"
            pendingLabel="Saving..."
            className={`${reviewButtonBase} border-[#c5ad67] bg-[#f1e7bf] text-[#675622] hover:bg-[#e8dca9]`}
          />
        </form>

        <form action={markSolid}>
          <input type="hidden" name="userPieceId" value={userPiece.id} />
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <SubmitButton
            label="Solid"
            pendingLabel="Saving..."
            className={`${reviewButtonBase} border-[#7b8a50] bg-[#9aaa72] text-[#f8faef] hover:bg-[#8d9d64]`}
          />
        </form>

        <RemoveFromPracticeButton
          userPieceId={userPiece.id}
          redirectTo={redirectTo}
          className="rounded-full border border-[#b8bcae] bg-[#d9ddd0] px-4 py-2 text-sm font-medium text-[#596056] shadow-sm transition hover:bg-[#cfd4c5] hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
        />
      </div>
    </article>
  )
}