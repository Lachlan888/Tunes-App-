import Link from "next/link"
import PracticeProgress from "@/components/practice/PracticeProgress"
import RemoveFromPracticeButton from "@/components/practice/RemoveFromPracticeButton"
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
      return "bg-[#f1e7bf] text-[#675622] border border-[#c5ad67]"
    case "Overdue":
      return "bg-[#ead0c5] text-[#6f3f36] border border-[#b98576]"
    case "Overdue (longest)":
      return "bg-[#e2c5bf] text-[#633833] border border-[#a8746d]"
    default:
      return "bg-[#edf2e4] text-[#435336] border border-[#b0bc8c]"
  }
}

export default function ActivePracticeSection({
  practiceItems,
  redirectTo,
}: ActivePracticeSectionProps) {
  return (
    <section className="mt-10 rounded-2xl border border-[#b0bc8c] bg-[#e4ead8] p-5 shadow-sm">
      <details>
        <summary className="cursor-pointer text-sm font-semibold uppercase tracking-[0.16em] text-[#596650]">
          Currently in practice ({practiceItems.length})
        </summary>

        <p className="mt-3 text-sm text-[#596650]">
          Full list of tunes currently in your practice system.
        </p>

        {practiceItems.length === 0 ? (
          <p className="mt-4 text-sm text-[#596650]">
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
                  ? "bg-[#edf2e4] text-[#596650] border border-[#b0bc8c]"
                  : "bg-[#edf2e4] text-[#435336] border border-[#b0bc8c]"

              return (
                <li
                  key={userPiece.id}
                  className="rounded-xl border border-[#b0bc8c] bg-[#f3f7ea]/70 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium">
                        {userPiece.piece ? (
                          <Link
                            href={`/library/${userPiece.piece.id}`}
                            className="decoration-[#7b8a50] underline-offset-4 hover:underline"
                          >
                            {userPiece.piece.title}
                          </Link>
                        ) : (
                          "Untitled piece"
                        )}
                      </p>

                      <p className="mt-1 text-sm text-[#596650]">
                        Key: {userPiece.piece?.key ?? "Unknown"} | Style:{" "}
                        {userPiece.piece?.style ?? "Unknown"} | Time:{" "}
                        {userPiece.piece?.time_signature ?? "Unknown"}
                      </p>

                      <p className="mt-1 text-sm text-[#596650]">
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
                          className="rounded-full border border-[#b0bc8c] px-3 py-2 text-sm font-medium text-[#596650] transition hover:bg-[#edf2e4] hover:text-[#20271c] focus:outline-none focus:ring-2 focus:ring-[rgba(123,138,80,0.28)]"
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