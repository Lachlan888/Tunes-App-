"use client"

import { useState } from "react"
import ActivePracticeFoci from "@/components/practice/ActivePracticeFoci"
import PendingLinkButton from "@/components/PendingLinkButton"
import PracticeProgress from "@/components/practice/PracticeProgress"
import RecentPracticeNotes from "@/components/practice/RecentPracticeNotes"
import PreferredReferenceControl from "@/components/reference-media/PreferredReferenceControl"
import RemoveFromPracticeButton from "@/components/practice/RemoveFromPracticeButton"
import ReviewNoteModal from "@/components/practice/ReviewNoteModal"
import {
  DiaryReviewButtons,
  DirectReviewForms,
} from "@/components/practice/ReviewOutcomeButtons"
import type { PracticeNoteCategory } from "@/lib/loaders/practice-diary"
import type { ReviewQueueItem } from "@/lib/loaders/review"
import type { ReviewOutcomeConfig } from "@/components/practice/reviewOutcomeConfig"

type PracticeReviewCardProps = {
  userPiece: ReviewQueueItem
  redirectTo: string
  badgeLabel: string
  badgeClassName: string
  practiceDiaryEnabled: boolean
  noteCategories: PracticeNoteCategory[]
  upsertPreferredReferenceUrl: (formData: FormData) => Promise<void>
}

export default function PracticeReviewCard({
  userPiece,
  redirectTo,
  practiceDiaryEnabled,
  noteCategories,
  upsertPreferredReferenceUrl,
}: PracticeReviewCardProps) {
  const [selectedOutcome, setSelectedOutcome] =
    useState<ReviewOutcomeConfig | null>(null)

  const title = userPiece.piece?.title ?? "Untitled piece"

  return (
    <article className="relative min-w-0 rounded-2xl border border-border bg-background/70 p-3 shadow-sm transition hover:bg-muted/70 sm:p-5">
      <div className="absolute right-3 top-3 z-10 sm:right-4 sm:top-4">
        <RemoveFromPracticeButton
          userPieceId={userPiece.id}
          redirectTo={redirectTo}
          confirmMessage={`Remove "${title}" from active practice? This stops review scheduling for this tune, but does not delete the shared tune or remove it from your lists.`}
          label="×"
          pendingLabel="…"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/80 text-lg font-semibold leading-none text-muted-foreground shadow-sm transition hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
        />
      </div>

      <div className="min-w-0 pr-10 sm:pr-12">
        <h2 className="break-words pr-1 text-center font-serif text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
          {userPiece.piece ? (
            <PendingLinkButton
              href={`/library/${userPiece.piece.id}`}
              label={title}
              pendingLabel="Loading..."
              className="decoration-primary decoration-2 underline-offset-4 hover:underline"
            />
          ) : (
            title
          )}
        </h2>

        <p className="mt-3 text-center text-sm font-medium leading-6 text-muted-foreground">
          Key:{" "}
          <span className="italic">
            {userPiece.piece?.key ?? "Unknown"}
          </span>{" "}
          <span aria-hidden="true">|</span> Style:{" "}
          <span className="italic">
            {userPiece.piece?.style ?? "Unknown"}
          </span>{" "}
          <span aria-hidden="true">|</span> Time:{" "}
          <span className="italic">
            {userPiece.piece?.time_signature ?? "Unknown"}
          </span>
        </p>
      </div>

      {userPiece.piece &&
      (userPiece.piece.reference_url || userPiece.media_links.length > 0) ? (
        <div className="mt-5 w-full">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {userPiece.is_using_preferred_reference
              ? "Preferred reference"
              : "Reference"}
          </p>
          <PreferredReferenceControl
            pieceId={userPiece.piece.id}
            title={userPiece.piece.title}
            defaultReferenceUrl={userPiece.piece.reference_url}
            mediaLinks={userPiece.media_links}
            metadata={userPiece.preferred_reference_metadata}
            redirectTo={redirectTo}
            savedLoops={userPiece.saved_media_loops}
            upsertPreferredReferenceUrl={upsertPreferredReferenceUrl}
            triggerClassName="flex w-full items-center justify-center rounded-full border border-border bg-muted px-4 py-2 text-center text-sm font-semibold text-muted-foreground transition hover:border-primary hover:bg-card hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          />
        </div>
      ) : null}

      <PracticeProgress stage={userPiece.stage} className="mt-5" />

      <ActivePracticeFoci foci={userPiece.active_practice_foci} />

      <RecentPracticeNotes notes={userPiece.recent_practice_notes} />

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          How did it go?
        </p>

        {practiceDiaryEnabled ? (
          <DiaryReviewButtons onSelectOutcome={setSelectedOutcome} />
        ) : (
          <DirectReviewForms
            userPieceId={userPiece.id}
            stage={userPiece.stage}
            nextReviewDue={userPiece.next_review_due}
            redirectTo={redirectTo}
          />
        )}
      </div>

      {selectedOutcome ? (
        <ReviewNoteModal
          selectedOutcome={selectedOutcome}
          userPiece={userPiece}
          redirectTo={redirectTo}
          title={title}
          noteCategories={noteCategories}
          onClose={() => setSelectedOutcome(null)}
        />
      ) : null}
    </article>
  )
}
