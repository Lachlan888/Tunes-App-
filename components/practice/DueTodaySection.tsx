import PracticeReviewCard from "@/components/practice/PracticeReviewCard"
import type { PracticeNoteCategory } from "@/lib/loaders/practice-diary"
import type { ReviewQueueItem } from "@/lib/loaders/review"

type DueTodaySectionProps = {
  dueTodayPieces: ReviewQueueItem[]
  redirectTo: string
  practiceDiaryEnabled: boolean
  noteCategories: PracticeNoteCategory[]
}

export default function DueTodaySection({
  dueTodayPieces,
  redirectTo,
  practiceDiaryEnabled,
  noteCategories,
}: DueTodaySectionProps) {
  return (
    <section
      id="due-today"
      className="mt-5 rounded-2xl border border-border bg-card p-4 shadow-sm md:mt-8 md:rounded-3xl md:p-6"
    >
      <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground md:text-sm">
        Due today
      </h2>

      {dueTodayPieces.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
          No tunes due today.
        </p>
      ) : (
        <>
          <p className="mt-3 text-sm leading-6 text-muted-foreground md:mt-4">
            {dueTodayPieces.length} tune
            {dueTodayPieces.length === 1 ? "" : "s"} due today.
          </p>

          <div className="mt-4 grid min-w-0 grid-cols-1 gap-4 md:mt-6 md:grid-cols-2 xl:grid-cols-3">
            {dueTodayPieces.map((userPiece) => (
              <PracticeReviewCard
                key={userPiece.id}
                userPiece={userPiece}
                redirectTo={redirectTo}
                badgeLabel="Due today"
                badgeClassName="border border-accent bg-accent/20 text-accent-foreground"
                practiceDiaryEnabled={practiceDiaryEnabled}
                noteCategories={noteCategories}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}