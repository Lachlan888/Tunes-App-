"use client"

import SubmitButton from "@/components/SubmitButton"
import {
  getReviewButtonClassName,
  REVIEW_OUTCOMES,
  type ReviewOutcomeConfig,
} from "@/components/practice/reviewOutcomeConfig"

type DirectReviewFormsProps = {
  userPieceId: number
  redirectTo: string
}

type DiaryReviewButtonsProps = {
  onSelectOutcome: (outcome: ReviewOutcomeConfig) => void
}

export function DirectReviewForms({
  userPieceId,
  redirectTo,
}: DirectReviewFormsProps) {
  return (
    <div className="mt-3 flex w-full gap-1 sm:w-auto sm:flex-wrap sm:gap-3">
      {REVIEW_OUTCOMES.map((reviewOutcome) => (
        <form
          key={reviewOutcome.outcome}
          action={reviewOutcome.action}
          className="min-w-0 flex-1 sm:flex-none"
        >
          <input type="hidden" name="userPieceId" value={userPieceId} />
          <input type="hidden" name="redirectTo" value={redirectTo} />

          <SubmitButton
            label={reviewOutcome.label}
            pendingLabel="Saving..."
            className={getReviewButtonClassName(reviewOutcome.className)}
          />
        </form>
      ))}
    </div>
  )
}

export function DiaryReviewButtons({
  onSelectOutcome,
}: DiaryReviewButtonsProps) {
  return (
    <div className="mt-3 flex w-full gap-1 sm:w-auto sm:flex-wrap sm:gap-3">
      {REVIEW_OUTCOMES.map((reviewOutcome) => (
        <button
          key={reviewOutcome.outcome}
          type="button"
          className={getReviewButtonClassName(reviewOutcome.className)}
          onClick={() => onSelectOutcome(reviewOutcome)}
        >
          {reviewOutcome.label}
        </button>
      ))}
    </div>
  )
}