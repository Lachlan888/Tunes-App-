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

export default function PracticeReviewCard({
  userPiece,
  redirectTo,
  badgeLabel,
  badgeClassName,
}: PracticeReviewCardProps) {
  return (
    <div className="rounded-lg border p-6">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-2xl font-semibold">
          {userPiece.piece ? (
            <Link
              href={`/library/${userPiece.piece.id}`}
              className="hover:underline"
            >
              {userPiece.piece.title}
            </Link>
          ) : (
            "Untitled piece"
          )}
        </h2>

        <span className={`rounded-full px-3 py-1 text-xs font-medium ${badgeClassName}`}>
          {badgeLabel}
        </span>
      </div>

      <p className="mt-2 text-sm text-gray-600">
        Key: {userPiece.piece?.key ?? "Unknown"} | Style:{" "}
        {userPiece.piece?.style ?? "Unknown"} | Time:{" "}
        {userPiece.piece?.time_signature ?? "Unknown"}
      </p>

      {userPiece.piece?.reference_url && userPiece.piece?.title && (
        <ReferenceMediaLink
          referenceUrl={userPiece.piece.reference_url}
          title={userPiece.piece.title}
        />
      )}

      <p className="mt-2 text-sm text-gray-600">
        Due: {formatDueDate(userPiece.next_review_due)}
      </p>

      <PracticeProgress stage={userPiece.stage} className="mt-3" />

      <div className="mt-6 flex flex-wrap gap-3">
        <form action={markFailed}>
          <input type="hidden" name="userPieceId" value={userPiece.id} />
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <SubmitButton
            label="Rough"
            pendingLabel="Saving..."
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          />
        </form>

        <form action={markShaky}>
          <input type="hidden" name="userPieceId" value={userPiece.id} />
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <SubmitButton
            label="Shaky"
            pendingLabel="Saving..."
            className="rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600"
          />
        </form>

        <form action={markSolid}>
          <input type="hidden" name="userPieceId" value={userPiece.id} />
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <SubmitButton
            label="Solid"
            pendingLabel="Saving..."
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          />
        </form>

        <RemoveFromPracticeButton
          userPieceId={userPiece.id}
          redirectTo={redirectTo}
          className="rounded-md border px-4 py-2 text-sm font-medium"
        />
      </div>
    </div>
  )
}