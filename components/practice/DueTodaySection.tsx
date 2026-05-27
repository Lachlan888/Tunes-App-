"use client"

import CardPager from "@/components/ui/CardPager"
import PracticeReviewCard from "@/components/practice/PracticeReviewCard"
import type { PracticeNoteCategory } from "@/lib/loaders/practice-diary"
import type { ReviewQueueItem } from "@/lib/loaders/review"

type DueTodaySectionProps = {
  dueTodayPieces: ReviewQueueItem[]
  redirectTo: string
  practiceDiaryEnabled: boolean
  noteCategories: PracticeNoteCategory[]
  upsertPreferredReferenceUrl: (formData: FormData) => Promise<void>
}

export default function DueTodaySection({
  dueTodayPieces,
  redirectTo,
  practiceDiaryEnabled,
  noteCategories,
  upsertPreferredReferenceUrl,
}: DueTodaySectionProps) {
  return (
    <section id="due-today" className="mt-6 md:mt-8">
      <h2 className="px-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground md:text-sm">
        Due today
      </h2>

      {dueTodayPieces.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
          No tunes due today.
        </p>
      ) : (
        <>
          <p className="mt-3 px-1 text-sm leading-6 text-muted-foreground md:mt-4">
            {dueTodayPieces.length} tune
            {dueTodayPieces.length === 1 ? "" : "s"} due today. Work through one
            tune at a time.
          </p>

          <CardPager
            className="mt-4 md:mt-6"
            items={dueTodayPieces}
            getKey={(userPiece) => userPiece.id}
            label="Due today review queue"
            previousLabel="Previous"
            nextLabel="Next"
            unstyledCard
            emptyState={
              <p className="rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
                No tunes due today.
              </p>
            }
            renderItem={(userPiece) => (
              <PracticeReviewCard
                userPiece={userPiece}
                redirectTo={redirectTo}
                badgeLabel="Due today"
                badgeClassName="border border-accent bg-accent/20 text-accent-foreground"
                practiceDiaryEnabled={practiceDiaryEnabled}
                noteCategories={noteCategories}
                upsertPreferredReferenceUrl={upsertPreferredReferenceUrl}
              />
            )}
          />
        </>
      )}
    </section>
  )
}
