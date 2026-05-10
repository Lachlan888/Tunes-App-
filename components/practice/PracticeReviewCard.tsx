"use client"

import { useEffect, useState } from "react"
import PendingLinkButton from "@/components/PendingLinkButton"
import PracticeProgress from "@/components/practice/PracticeProgress"
import ReferenceMediaLink from "@/components/ReferenceMediaLink"
import RemoveFromPracticeButton from "@/components/practice/RemoveFromPracticeButton"
import SubmitButton from "@/components/SubmitButton"
import { buttonStyles } from "@/components/ui/buttonStyles"
import { markFailed, markShaky, markSolid } from "@/lib/actions/reviews"
import { APP_TIME_ZONE } from "@/lib/review"
import type { PracticeNoteCategory } from "@/lib/loaders/practice-diary"
import type {
  RecentPracticeNoteForReview,
  ReviewQueueItem,
} from "@/lib/loaders/review"

type ReviewOutcome = "failed" | "shaky" | "solid"

type ReviewOutcomeConfig = {
  outcome: ReviewOutcome
  label: string
  modalTitle: string
  action: (formData: FormData) => Promise<void>
  className: string
}

type PracticeReviewCardProps = {
  userPiece: ReviewQueueItem
  redirectTo: string
  badgeLabel: string
  badgeClassName: string
  practiceDiaryEnabled: boolean
  noteCategories: PracticeNoteCategory[]
}

const REVIEW_OUTCOMES: ReviewOutcomeConfig[] = [
  {
    outcome: "failed",
    label: "Rough",
    modalTitle: "Rough review note",
    action: markFailed,
    className: buttonStyles.reviewRough,
  },
  {
    outcome: "shaky",
    label: "Shaky",
    modalTitle: "Shaky review note",
    action: markShaky,
    className: buttonStyles.reviewShaky,
  },
  {
    outcome: "solid",
    label: "Solid",
    modalTitle: "Solid review note",
    action: markSolid,
    className: buttonStyles.reviewSolid,
  },
]

function formatDueDate(dateValue: string | null) {
  if (!dateValue) return "No due date"

  return new Date(dateValue).toLocaleDateString("en-AU", {
    timeZone: APP_TIME_ZONE,
  })
}

function formatDateOnly(dateOnly: string | null) {
  if (!dateOnly) return "Undated"

  const [year, month, day] = dateOnly.split("-")

  if (!year || !month || !day) {
    return dateOnly
  }

  return `${day}/${month}/${year}`
}

function RecentPracticeNotes({
  notes,
}: {
  notes: RecentPracticeNoteForReview[]
}) {
  const [isOpen, setIsOpen] = useState(false)

  if (notes.length === 0) {
    return null
  }

  return (
    <div className="mt-5 rounded-2xl border border-border bg-background/70 p-4">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 text-left"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>
          <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Recent notes
          </span>
          <span className="mt-1 block text-sm text-muted-foreground">
            {notes.length} recent note{notes.length === 1 ? "" : "s"} for this
            tune
          </span>
        </span>

        <span className="shrink-0 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
          {isOpen ? "Hide" : "Show"}
        </span>
      </button>

      {isOpen ? (
        <ol className="mt-4 space-y-3">
          {notes.map((note) => (
            <li
              key={note.id}
              className="rounded-xl border border-border bg-muted/70 p-3"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <span>{formatDateOnly(note.practice_date)}</span>

                {note.category_name ? (
                  <>
                    <span aria-hidden="true">|</span>
                    <span>{note.category_name}</span>
                  </>
                ) : null}
              </div>

              <p className="mt-2 text-sm leading-6 text-foreground">
                {note.body}
              </p>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  )
}

function DirectReviewForms({
  userPieceId,
  redirectTo,
}: {
  userPieceId: number
  redirectTo: string
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-3">
      {REVIEW_OUTCOMES.map((reviewOutcome) => (
        <form key={reviewOutcome.outcome} action={reviewOutcome.action}>
          <input type="hidden" name="userPieceId" value={userPieceId} />
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <SubmitButton
            label={reviewOutcome.label}
            pendingLabel="Saving..."
            className={reviewOutcome.className}
          />
        </form>
      ))}
    </div>
  )
}

function DiaryReviewButtons({
  onSelectOutcome,
}: {
  onSelectOutcome: (outcome: ReviewOutcomeConfig) => void
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-3">
      {REVIEW_OUTCOMES.map((reviewOutcome) => (
        <button
          key={reviewOutcome.outcome}
          type="button"
          className={reviewOutcome.className}
          onClick={() => onSelectOutcome(reviewOutcome)}
        >
          {reviewOutcome.label}
        </button>
      ))}
    </div>
  )
}

function ReviewNoteModal({
  selectedOutcome,
  userPieceId,
  redirectTo,
  title,
  noteCategories,
  onClose,
}: {
  selectedOutcome: ReviewOutcomeConfig
  userPieceId: number
  redirectTo: string
  title: string
  noteCategories: PracticeNoteCategory[]
  onClose: () => void
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 px-4 py-8"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-note-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Practice diary
            </p>

            <h3
              id="review-note-modal-title"
              className="mt-2 font-serif text-2xl font-bold text-foreground"
            >
              {selectedOutcome.modalTitle}
            </h3>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Add an optional note for {title}. Saving will also record the{" "}
              {selectedOutcome.label.toLowerCase()} review result.
            </p>
          </div>

          <button
            type="button"
            className={buttonStyles.text}
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <form action={selectedOutcome.action} className="mt-5 space-y-4">
          <input type="hidden" name="userPieceId" value={userPieceId} />
          <input type="hidden" name="redirectTo" value={redirectTo} />

          <label className="block">
            <span className="text-sm font-semibold text-foreground">
              Category
            </span>

            <select
              name="category_id"
              defaultValue=""
              className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            >
              <option value="">No category</option>
              {noteCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-foreground">
              Optional note
            </span>

            <textarea
              name="practice_note"
              rows={5}
              placeholder="What happened with this tune today?"
              className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm leading-6 text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <SubmitButton
              label={`Save ${selectedOutcome.label}`}
              pendingLabel="Saving..."
              className={selectedOutcome.className}
            />

            <button
              type="button"
              className={buttonStyles.secondary}
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
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
    <article className="relative rounded-2xl border border-border bg-background/70 p-5 shadow-sm transition hover:bg-muted/70">
      <div className="absolute right-4 top-4 z-10">
        <RemoveFromPracticeButton
          userPieceId={userPiece.id}
          redirectTo={redirectTo}
          confirmMessage={`Remove "${title}" from active practice? This stops review scheduling for this tune, but does not delete the shared tune or remove it from your lists.`}
          label="×"
          pendingLabel="…"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/80 text-lg font-semibold leading-none text-muted-foreground shadow-sm transition hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
        />
      </div>

      <div className="flex items-start justify-between gap-4 pr-12">
        <div className="min-w-0 flex-1">
          <h2 className="font-serif text-3xl font-bold leading-tight tracking-tight text-foreground">
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
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${badgeClassName}`}
        >
          {badgeLabel}
        </span>
      </div>

      {userPiece.piece?.reference_url && userPiece.piece?.title && (
        <div className="mt-4 w-full">
          <ReferenceMediaLink
            referenceUrl={userPiece.piece.reference_url}
            title={userPiece.piece.title}
            className="text-sm font-medium text-muted-foreground underline underline-offset-4 transition hover:text-foreground"
          />
        </div>
      )}

      <PracticeProgress stage={userPiece.stage} className="mt-5" />

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
          userPieceId={userPiece.id}
          redirectTo={redirectTo}
          title={title}
          noteCategories={noteCategories}
          onClose={() => setSelectedOutcome(null)}
        />
      ) : null}
    </article>
  )
}