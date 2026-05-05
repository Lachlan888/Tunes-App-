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
    <section className="mt-8 rounded-2xl border border-[#b0bc8c] bg-[#e4ead8] p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#596650]">
        Due next
      </h2>

      {dueTodayPieces.length === 0 ? (
        <p className="mt-4 text-sm text-[#596650]">No tunes due today.</p>
      ) : (
        <>
          <p className="mt-4 text-sm text-[#596650]">
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
                badgeClassName="bg-[#edf2e4] text-[#435336] border border-[#b0bc8c]"
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}