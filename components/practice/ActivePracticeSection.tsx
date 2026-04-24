import Link from "next/link"
import PracticeProgress from "@/components/PracticeProgress"
import RemoveFromPracticeButton from "@/components/RemoveFromPracticeButton"
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
      return "bg-amber-100 text-amber-800"
    case "Overdue":
      return "bg-orange-100 text-orange-800"
    case "Overdue (longest)":
      return "bg-rose-100 text-rose-800"
    default:
      return "bg-blue-100 text-blue-700"
  }
}

export default function ActivePracticeSection({
  practiceItems,
  redirectTo,
}: ActivePracticeSectionProps) {
  return (
    <section className="mt-10 rounded-lg border p-4">
      <details>
        <summary className="cursor-pointer text-lg font-semibold">
          Active practice tunes ({practiceItems.length})
        </summary>

        <p className="mt-2 text-sm text-gray-600">
          Full list of tunes currently in your practice system.
        </p>

        {practiceItems.length === 0 ? (
          <p className="mt-4 text-sm text-gray-600">
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
                  ? "bg-gray-100 text-gray-700"
                  : "bg-blue-100 text-blue-700"

              return (
                <li key={userPiece.id} className="rounded border p-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium">
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
                      </p>

                      <p className="mt-1 text-sm text-gray-600">
                        Key: {userPiece.piece?.key ?? "Unknown"} | Style:{" "}
                        {userPiece.piece?.style ?? "Unknown"} | Time:{" "}
                        {userPiece.piece?.time_signature ?? "Unknown"}
                      </p>

                      <p className="mt-1 text-sm text-gray-600">
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
                          className="rounded-md border px-3 py-2 text-sm font-medium"
                        />
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${badgeClassName}`}
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