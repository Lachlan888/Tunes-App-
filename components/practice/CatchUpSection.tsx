"use client"

import CardPager from "@/components/ui/CardPager"
import PracticeReviewCard from "@/components/practice/PracticeReviewCard"
import type { PracticeNoteCategory } from "@/lib/loaders/practice-diary"
import type { ReviewQueueItem } from "@/lib/loaders/review"

type CatchUpSectionProps = {
  catchUpQueue: ReviewQueueItem[]
  redirectTo: string
  defaultOpen?: boolean
  practiceDiaryEnabled: boolean
  noteCategories: PracticeNoteCategory[]
  upsertPreferredReferenceUrl: (formData: FormData) => Promise<void>
}

function CatchUpReviewPager({
  queue,
  redirectTo,
  practiceDiaryEnabled,
  noteCategories,
  upsertPreferredReferenceUrl,
  emptyMessage,
}: {
  queue: ReviewQueueItem[]
  redirectTo: string
  practiceDiaryEnabled: boolean
  noteCategories: PracticeNoteCategory[]
  upsertPreferredReferenceUrl: (formData: FormData) => Promise<void>
  emptyMessage: string
}) {
  return (
    <CardPager
      items={queue}
      getKey={(userPiece) => userPiece.id}
      label="Catch-up review queue"
      previousLabel="Previous"
      nextLabel="Next"
      unstyledCard
      emptyState={
        <p className="rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      }
      renderItem={(userPiece) => (
        <PracticeReviewCard
          userPiece={userPiece}
          redirectTo={redirectTo}
          badgeLabel="Overdue"
          badgeClassName="border border-destructive/40 bg-destructive/15 text-destructive"
          practiceDiaryEnabled={practiceDiaryEnabled}
          noteCategories={noteCategories}
          upsertPreferredReferenceUrl={upsertPreferredReferenceUrl}
        />
      )}
    />
  )
}

export default function CatchUpSection({
  catchUpQueue,
  redirectTo,
  defaultOpen = false,
  practiceDiaryEnabled,
  noteCategories,
  upsertPreferredReferenceUrl,
}: CatchUpSectionProps) {
  return (
    <section id="catch-up" className="mt-6 md:mt-8">
      <div className="md:hidden">
        {catchUpQueue.length === 0 ? (
          <p className="rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
            Nothing overdue right now.
          </p>
        ) : (
          <CatchUpReviewPager
            queue={catchUpQueue}
            redirectTo={redirectTo}
            practiceDiaryEnabled={practiceDiaryEnabled}
            noteCategories={noteCategories}
            upsertPreferredReferenceUrl={upsertPreferredReferenceUrl}
            emptyMessage="Nothing overdue right now."
          />
        )}
      </div>

      <div className="hidden md:block">
        <details open={defaultOpen}>
          <summary className="cursor-pointer px-1 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Catch up ({catchUpQueue.length})
          </summary>

          {catchUpQueue.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
              Nothing overdue right now.
            </p>
          ) : (
            <div className="mt-4 grid gap-4">
              <p className="px-1 text-sm leading-6 text-muted-foreground">
                Overdue tunes that need review.
              </p>

              <CatchUpReviewPager
                queue={catchUpQueue}
                redirectTo={redirectTo}
                practiceDiaryEnabled={practiceDiaryEnabled}
                noteCategories={noteCategories}
                upsertPreferredReferenceUrl={upsertPreferredReferenceUrl}
                emptyMessage="Nothing overdue right now."
              />
            </div>
          )}
        </details>
      </div>
    </section>
  )
}
