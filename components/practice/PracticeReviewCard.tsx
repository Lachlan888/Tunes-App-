"use client"

import Link from "next/link"
import { useState } from "react"
import ActivePracticeFoci from "@/components/practice/ActivePracticeFoci"
import PendingLinkButton from "@/components/PendingLinkButton"
import PracticeProgress from "@/components/practice/PracticeProgress"
import RecentPracticeNotes from "@/components/practice/RecentPracticeNotes"
import ReferenceMediaLink from "@/components/ReferenceMediaLink"
import RemoveFromPracticeButton from "@/components/practice/RemoveFromPracticeButton"
import ReviewNoteModal from "@/components/practice/ReviewNoteModal"
import {
  DiaryReviewButtons,
  DirectReviewForms,
} from "@/components/practice/ReviewOutcomeButtons"
import { APP_TIME_ZONE } from "@/lib/review"
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
}

function formatDueDate(dateValue: string | null) {
  if (!dateValue) return "No due date"

  return new Date(dateValue).toLocaleDateString("en-AU", {
    timeZone: APP_TIME_ZONE,
  })
}

export default function PracticeReviewCard({
  userPiece,
  redirectTo,
  badgeLabel,
  badgeClassName,
  practiceDiaryEnabled,
  noteCategories,
}: PracticeReviewCardProps) {
  const [selectedOutcome, setSelectedOutcome] =
    useState<ReviewOutcomeConfig | null>(null)

  const title = userPiece.piece?.title ?? "Untitled piece"

  return (
    <article className="relative min-w-0 overflow-hidden rounded-2xl border border-border bg-background/70 p-3 shadow-sm transition hover:bg-muted/70 sm:p-5">
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

      <div className="flex min-w-0 flex-col gap-3 pr-10 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:pr-12">
        <div className="min-w-0 flex-1">
          <h2 className="break-words pr-1 font-serif text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
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

          <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">
            Key: {userPiece.piece?.key ?? "Unknown"}{" "}
            <span aria-hidden="true">|</span> Style:{" "}
            {userPiece.piece?.style ?? "Unknown"}{" "}
            <span aria-hidden="true">|</span> Time:{" "}
            {userPiece.piece?.time_signature ?? "Unknown"}
          </p>

          <p className="mt-1 text-sm font-medium leading-6 text-muted-foreground">
            Due: {formatDueDate(userPiece.next_review_due)}
          </p>
        </div>

        <span
          className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${badgeClassName}`}
        >
          {badgeLabel}
        </span>
      </div>

      {userPiece.piece?.reference_url && userPiece.piece?.title ? (
        <div className="mt-4 w-full">
          <ReferenceMediaLink
            referenceUrl={userPiece.piece.reference_url}
            title={userPiece.piece.title}
            className="text-sm font-medium text-muted-foreground underline underline-offset-4 transition hover:text-foreground"
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