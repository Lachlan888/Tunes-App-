"use client"

import { useEffect, useState } from "react"
import SubmitButton from "@/components/SubmitButton"
import { logTunePracticeCheck } from "@/lib/actions/practice-diary"
import { markFailed, markShaky, markSolid } from "@/lib/actions/reviews"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import type { PracticeNoteCategory } from "@/lib/loaders/practice-diary"
import type { Piece, UserPiece } from "@/lib/types"

type FormalReviewOutcome = "failed" | "shaky" | "solid"
type DiaryPracticeOutcome = "rough" | "shaky" | "solid"

type ReviewMode = "formal" | "diary"

type ReviewOutcomeConfig = {
  mode: ReviewMode
  outcome: FormalReviewOutcome | DiaryPracticeOutcome
  label: string
  modalTitle: string
  explanation: string
  className: string
  action: (formData: FormData) => Promise<void>
}

type TunePageReviewPanelProps = {
  piece: Piece
  userPiece: UserPiece | null
  redirectTo: string
  practiceDiaryEnabled: boolean
  noteCategories: PracticeNoteCategory[]
}

const FORMAL_REVIEW_OUTCOMES: ReviewOutcomeConfig[] = [
  {
    mode: "formal",
    outcome: "failed",
    label: "Rough",
    modalTitle: "Rough review note",
    explanation:
      "This is a formal review. Saving will update Stage and the next review date.",
    className: buttonStyles.reviewRough,
    action: markFailed,
  },
  {
    mode: "formal",
    outcome: "shaky",
    label: "Shaky",
    modalTitle: "Shaky review note",
    explanation:
      "This is a formal review. Saving will update Stage and the next review date.",
    className: buttonStyles.reviewShaky,
    action: markShaky,
  },
  {
    mode: "formal",
    outcome: "solid",
    label: "Solid",
    modalTitle: "Solid review note",
    explanation:
      "This is a formal review. Saving will update Stage and the next review date.",
    className: buttonStyles.reviewSolid,
    action: markSolid,
  },
]

const DIARY_PRACTICE_OUTCOMES: ReviewOutcomeConfig[] = [
  {
    mode: "diary",
    outcome: "rough",
    label: "Rough",
    modalTitle: "Rough practice check",
    explanation:
      "This is a diary-only practice check. It records what happened today but does not update Stage or the next review date.",
    className: buttonStyles.reviewRough,
    action: logTunePracticeCheck,
  },
  {
    mode: "diary",
    outcome: "shaky",
    label: "Shaky",
    modalTitle: "Shaky practice check",
    explanation:
      "This is a diary-only practice check. It records what happened today but does not update Stage or the next review date.",
    className: buttonStyles.reviewShaky,
    action: logTunePracticeCheck,
  },
  {
    mode: "diary",
    outcome: "solid",
    label: "Solid",
    modalTitle: "Solid practice check",
    explanation:
      "This is a diary-only practice check. It records what happened today but does not update Stage or the next review date.",
    className: buttonStyles.reviewSolid,
    action: logTunePracticeCheck,
  },
]

function ReviewNoteModal({
  selectedOutcome,
  piece,
  userPiece,
  redirectTo,
  noteCategories,
  onClose,
}: {
  selectedOutcome: ReviewOutcomeConfig
  piece: Piece
  userPiece: UserPiece | null
  redirectTo: string
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
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 px-3 py-3 sm:items-center sm:px-4 sm:py-8"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border bg-card p-4 shadow-xl sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tune-page-review-note-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex min-w-0 items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Practice diary
            </p>

            <h3
              id="tune-page-review-note-modal-title"
              className="mt-2 break-words font-serif text-2xl font-bold text-foreground"
            >
              {selectedOutcome.modalTitle}
            </h3>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Add an optional note for {piece.title}. {selectedOutcome.explanation}
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
          {selectedOutcome.mode === "formal" && userPiece ? (
            <>
              <input type="hidden" name="userPieceId" value={userPiece.id} />
              <input type="hidden" name="redirectTo" value={redirectTo} />
            </>
          ) : (
            <>
              <input type="hidden" name="piece_id" value={piece.id} />
              <input type="hidden" name="redirect_to" value={redirectTo} />
              <input
                type="hidden"
                name="practice_outcome"
                value={selectedOutcome.outcome}
              />
            </>
          )}

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

          <div className="grid gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
            <SubmitButton
              label={`Save ${selectedOutcome.label}`}
              pendingLabel="Saving..."
              className={joinClasses(selectedOutcome.className, "w-full sm:w-auto")}
            />

            <button
              type="button"
              className={joinClasses(buttonStyles.secondary, "w-full sm:w-auto")}
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

function DirectFormalReviewForms({
  userPieceId,
  redirectTo,
}: {
  userPieceId: number
  redirectTo: string
}) {
  return (
    <div className="mt-4 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3">
      {FORMAL_REVIEW_OUTCOMES.map((reviewOutcome) => (
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

export default function TunePageReviewPanel({
  piece,
  userPiece,
  redirectTo,
  practiceDiaryEnabled,
  noteCategories,
}: TunePageReviewPanelProps) {
  const [selectedOutcome, setSelectedOutcome] =
    useState<ReviewOutcomeConfig | null>(null)

  const isFormalReview = Boolean(userPiece)
  const reviewOutcomes = isFormalReview
    ? FORMAL_REVIEW_OUTCOMES
    : DIARY_PRACTICE_OUTCOMES

  return (
    <section className="w-full max-w-full overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Review / practice check
      </h2>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {isFormalReview
          ? "This tune is in practice. Use these buttons for a formal review that updates Stage and the next review date."
          : "This tune is not in practice. Use these buttons to log a diary-only practice check without changing Stage or review scheduling."}
      </p>

      {!practiceDiaryEnabled && !isFormalReview ? (
        <div className="mt-5 rounded-2xl border border-border bg-background/70 p-4">
          <p className="text-sm leading-6 text-muted-foreground">
            Enable Practice Diary on your Profile page to log practice checks for
            tunes that are not in practice.
          </p>
        </div>
      ) : practiceDiaryEnabled ? (
        <div className="mt-4 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3">
          {reviewOutcomes.map((reviewOutcome) => (
            <button
              key={`${reviewOutcome.mode}-${reviewOutcome.outcome}`}
              type="button"
              className={reviewOutcome.className}
              onClick={() => setSelectedOutcome(reviewOutcome)}
            >
              {reviewOutcome.label}
            </button>
          ))}
        </div>
      ) : userPiece ? (
        <DirectFormalReviewForms
          userPieceId={userPiece.id}
          redirectTo={redirectTo}
        />
      ) : null}

      {selectedOutcome ? (
        <ReviewNoteModal
          selectedOutcome={selectedOutcome}
          piece={piece}
          userPiece={userPiece}
          redirectTo={redirectTo}
          noteCategories={noteCategories}
          onClose={() => setSelectedOutcome(null)}
        />
      ) : null}
    </section>
  )
}