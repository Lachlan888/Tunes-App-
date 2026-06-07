"use client"

import SubmitButton from "@/components/SubmitButton"
import {
  getReviewButtonClassName,
  REVIEW_OUTCOMES,
  type ReviewOutcomeConfig,
} from "@/components/practice/reviewOutcomeConfig"

type DirectReviewFormsProps = {
  userPieceId: number
  stage: number
  nextReviewDue: string | null
  redirectTo: string
}

type DiaryReviewButtonsProps = {
  onSelectOutcome: (outcome: ReviewOutcomeConfig) => void
}

type TooltipAlignment = "left" | "center" | "right"

function getTooltipAlignment(index: number, total: number): TooltipAlignment {
  if (index === 0) {
    return "left"
  }

  if (index === total - 1) {
    return "right"
  }

  return "center"
}

function getTooltipPositionClassName(alignment: TooltipAlignment) {
  if (alignment === "left") {
    return "left-0"
  }

  if (alignment === "right") {
    return "right-0"
  }

  return "left-1/2 -translate-x-1/2"
}

export function buildReviewSubmissionKey({
  userPieceId,
  stage,
  nextReviewDue,
  outcome,
}: {
  userPieceId: number
  stage: number
  nextReviewDue: string | null
  outcome: string
}) {
  return [
    "formal-review",
    userPieceId,
    stage,
    nextReviewDue ?? "no-due-date",
    outcome,
  ].join(":")
}

function ReviewOutcomeTooltip({
  tooltip,
  alignment,
}: {
  tooltip: string
  alignment: TooltipAlignment
}) {
  return (
    <span
      className={[
        "pointer-events-none absolute bottom-full z-30 mb-2 hidden w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-foreground px-3 py-2 text-center text-xs font-medium leading-5 text-background shadow-lg group-hover:block",
        getTooltipPositionClassName(alignment),
      ].join(" ")}
    >
      {tooltip}
    </span>
  )
}

export function DirectReviewForms({
  userPieceId,
  stage,
  nextReviewDue,
  redirectTo,
}: DirectReviewFormsProps) {
  return (
    <div className="mt-3 flex w-full gap-1 sm:w-auto sm:flex-wrap sm:gap-3">
      {REVIEW_OUTCOMES.map((reviewOutcome, index) => {
        const alignment = getTooltipAlignment(index, REVIEW_OUTCOMES.length)

        return (
          <form
            key={reviewOutcome.outcome}
            action={reviewOutcome.action}
            className="group relative min-w-0 flex-1 sm:flex-none"
          >
            <input type="hidden" name="userPieceId" value={userPieceId} />
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <input
              type="hidden"
              name="reviewSubmissionKey"
              value={buildReviewSubmissionKey({
                userPieceId,
                stage,
                nextReviewDue,
                outcome: reviewOutcome.outcome,
              })}
            />

            <SubmitButton
              label={reviewOutcome.label}
              pendingLabel="Saving..."
              className={getReviewButtonClassName(reviewOutcome.className)}
            />

            <ReviewOutcomeTooltip
              tooltip={reviewOutcome.tooltip}
              alignment={alignment}
            />
          </form>
        )
      })}
    </div>
  )
}

export function DiaryReviewButtons({
  onSelectOutcome,
}: DiaryReviewButtonsProps) {
  return (
    <div className="mt-3 flex w-full gap-1 sm:w-auto sm:flex-wrap sm:gap-3">
      {REVIEW_OUTCOMES.map((reviewOutcome, index) => {
        const alignment = getTooltipAlignment(index, REVIEW_OUTCOMES.length)

        return (
          <div
            key={reviewOutcome.outcome}
            className="group relative min-w-0 flex-1 sm:flex-none"
          >
            <button
              type="button"
              className={getReviewButtonClassName(reviewOutcome.className)}
              onClick={() => onSelectOutcome(reviewOutcome)}
            >
              {reviewOutcome.label}
            </button>

            <ReviewOutcomeTooltip
              tooltip={reviewOutcome.tooltip}
              alignment={alignment}
            />
          </div>
        )
      })}
    </div>
  )
}
