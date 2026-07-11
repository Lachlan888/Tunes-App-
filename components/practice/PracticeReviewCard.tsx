"use client"

import { useState } from "react"
import ActivePracticeFoci from "@/components/practice/ActivePracticeFoci"
import PendingLinkButton from "@/components/PendingLinkButton"
import PracticeProgress from "@/components/practice/PracticeProgress"
import RecentPracticeNotes from "@/components/practice/RecentPracticeNotes"
import RemoveFromPracticeButton from "@/components/practice/RemoveFromPracticeButton"
import ReferenceMediaEmbed from "@/components/library/ReferenceMediaEmbed"
import ReviewNoteModal from "@/components/practice/ReviewNoteModal"
import {
  DiaryReviewButtons,
  DirectReviewForms,
} from "@/components/practice/ReviewOutcomeButtons"
import type { PracticeNoteCategory } from "@/lib/loaders/practice-diary"
import type { ReviewQueueItem } from "@/lib/loaders/review"
import type { ReviewOutcomeConfig } from "@/components/practice/reviewOutcomeConfig"
import { getLoopsForSource } from "@/lib/tune-media"

type PracticeReviewCardProps = {
  userPiece: ReviewQueueItem
  redirectTo: string
  badgeLabel: string
  badgeClassName: string
  practiceDiaryEnabled: boolean
  noteCategories: PracticeNoteCategory[]
}

export default function PracticeReviewCard({
  userPiece,
  redirectTo,
  practiceDiaryEnabled,
  noteCategories,
}: PracticeReviewCardProps) {
  const [selectedOutcome, setSelectedOutcome] =
    useState<ReviewOutcomeConfig | null>(null)

  const title = userPiece.piece?.title ?? "Untitled piece"

  return (
    <article className="min-w-0 rounded-2xl border border-border bg-background/70 p-3 shadow-sm transition hover:bg-muted/70 sm:p-5">
      <div className="mb-2 flex justify-end">
        <RemoveFromPracticeButton
          userPieceId={userPiece.id}
          redirectTo={redirectTo}
          confirmMessage={`Stop Practice for "${title}"? Review scheduling will stop. The tune will remain in any lists, the shared tune will not be deleted, and stopping Practice does not automatically mark it Known.`}
          label="Stop Practice"
          pendingLabel="Stopping..."
          className="inline-flex min-h-9 items-center justify-center rounded-full border border-destructive/50 bg-background/80 px-3 py-1.5 text-xs font-semibold text-destructive shadow-sm transition hover:bg-destructive/10 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
        />
      </div>

      <div className="min-w-0">
        <h2 className="break-words text-center font-serif text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
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

      {userPiece.piece && userPiece.media_bundle.effectiveReference ? (
        <div className="mt-5 w-full">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Reference Media
          </p>
          <ReferenceMediaEmbed
            referenceUrl={userPiece.media_bundle.effectiveReference.url}
            title={userPiece.media_bundle.effectiveReference.label || title}
            showHeading={false}
            pieceId={userPiece.piece.id}
            redirectTo={redirectTo}
            savedLoops={getLoopsForSource(
              userPiece.media_bundle,
              userPiece.media_bundle.effectiveReference
            )}
            triggerLabel="Open Reference Media"
            triggerClassName="flex w-full items-center justify-center rounded-full border border-border bg-muted px-4 py-2 text-center text-sm font-semibold text-muted-foreground transition hover:border-primary hover:bg-card hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          />
          <div className="mt-2 text-center">
            <PendingLinkButton
              href={`/library/${userPiece.piece.id}#reference-media`}
              label="Tune Detail"
              pendingLabel="Opening..."
              className="text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
            />
          </div>
          {userPiece.media_bundle.additionalMedia.length > 0 ? (
            <div className="mt-3 text-center text-xs text-muted-foreground">
              {userPiece.media_bundle.additionalMedia.length} additional source
              {userPiece.media_bundle.additionalMedia.length === 1 ? "" : "s"} on
              Tune Detail
            </div>
          ) : null}
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
