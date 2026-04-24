import PracticeReviewCard from "@/components/practice/PracticeReviewCard"
import type { ReviewQueueItem } from "@/lib/loaders/review"

type DueTodaySectionProps = {
  dueTodayPieces: ReviewQueueItem[]
  redirectTo: string
}

export default function DueTodaySection({
  dueTodayPieces,
  redirectTo,
}: DueTodaySectionProps) {
  return (
    <section className="mt-8">
      {dueTodayPieces.length === 0 ? (
        <p className="text-gray-600">No tunes due today.</p>
      ) : (
        <>
          <p className="mt-4 text-sm text-gray-600">
            {dueTodayPieces.length} tune
            {dueTodayPieces.length === 1 ? "" : "s"} due today
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {dueTodayPieces.map((userPiece) => (
              <PracticeReviewCard
                key={userPiece.id}
                userPiece={userPiece}
                redirectTo={redirectTo}
                badgeLabel="Due today"
                badgeClassName="bg-blue-100 text-blue-700"
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}