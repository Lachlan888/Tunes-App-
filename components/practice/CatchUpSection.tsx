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
      return "bg-amber-100 text-amber-800"
    case "Overdue":
      return "bg-orange-100 text-orange-800"
    case "Overdue (longest)":
      return "bg-rose-100 text-rose-800"
    default:
      return "bg-blue-100 text-blue-700"
  }
}

export default function CatchUpSection({
  catchUpQueue,
  backlogSummary,
  redirectTo,
  defaultOpen = false,
}: CatchUpSectionProps) {
  return (
    <section id="catch-up" className="mt-8 rounded-lg border p-4">
      <details open={defaultOpen}>
        <summary className="cursor-pointer text-lg font-semibold">
          Catch up ({catchUpQueue.length})
        </summary>

        <p className="mt-2 text-sm text-gray-600">
          Work through overdue tunes in order, starting with the ones that have
          waited longest.
        </p>

        {catchUpQueue.length === 0 ? (
          <p className="mt-4 text-sm text-gray-600">
            Nothing overdue right now.
          </p>
        ) : (
          <>
            <ul className="mt-4 space-y-2">
              {backlogSummary.map((group) => (
                <li
                  key={group.tier}
                  className="flex items-center justify-between rounded border px-3 py-2"
                >
                  <span className="text-sm font-medium">{group.label}</span>
                  <span className="text-sm text-gray-600">{group.count}</span>
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
                  badgeClassName={getStatusBadgeClasses(userPiece.backlog_label)}
                />
              ))}
            </div>
          </>
        )}
      </details>
    </section>
  )
}