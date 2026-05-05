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
      return "bg-[#f1e7bf] text-[#675622] border border-[#c5ad67]"
    case "Overdue":
      return "bg-[#ead0c5] text-[#6f3f36] border border-[#b98576]"
    case "Overdue (longest)":
      return "bg-[#e2c5bf] text-[#633833] border border-[#a8746d]"
    default:
      return "bg-[#edf2e4] text-[#435336] border border-[#b0bc8c]"
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
      className="mt-8 rounded-2xl border border-[#b0bc8c] bg-[#e4ead8] p-5 shadow-sm"
    >
      <details open={defaultOpen}>
        <summary className="cursor-pointer text-sm font-semibold uppercase tracking-[0.16em] text-[#596650]">
          Catch up ({catchUpQueue.length})
        </summary>

        <p className="mt-3 text-sm text-[#596650]">
          Catch up on overdue tunes.
        </p>

        {catchUpQueue.length === 0 ? (
          <p className="mt-4 text-sm text-[#596650]">
            Nothing overdue right now.
          </p>
        ) : (
          <>
            <ul className="mt-4 space-y-2">
              {backlogSummary.map((group) => (
                <li
                  key={group.tier}
                  className="flex items-center justify-between rounded-xl border border-[#b0bc8c] bg-[#f3f7ea]/70 px-3 py-2"
                >
                  <span className="text-sm font-medium">{group.label}</span>
                  <span className="text-sm text-[#596650]">{group.count}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              {catchUpQueue.map((userPiece) => (
                <PracticeReviewCard
                  key={userPiece.id}
                  userPiece={userPiece}
                  redirectTo={redirectTo}
                  badgeLabel={userPiece.backlog_label ?? "Overdue"}
                  badgeClassName={getStatusBadgeClasses(
                    userPiece.backlog_label,
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