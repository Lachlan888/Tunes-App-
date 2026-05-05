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
    <section className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Due next
      </h2>

      {dueTodayPieces.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
          No tunes due today.
        </p>
      ) : (
        <>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            {dueTodayPieces.length} tune
            {dueTodayPieces.length === 1 ? "" : "s"} due today.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {dueTodayPieces.map((userPiece) => (
              <PracticeReviewCard
                key={userPiece.id}
                userPiece={userPiece}
                redirectTo={redirectTo}
                badgeLabel="Due today"
                badgeClassName="border border-accent bg-accent/20 text-accent-foreground"
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}