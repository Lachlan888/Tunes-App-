import { buttonStyles } from "@/components/ui/buttonStyles"
import { markFailed, markShaky, markSolid } from "@/lib/actions/reviews"

export type ReviewOutcome = "failed" | "shaky" | "solid"

export type ReviewOutcomeConfig = {
  outcome: ReviewOutcome
  label: string
  modalTitle: string
  action: (formData: FormData) => Promise<void>
  className: string
}

export const REVIEW_OUTCOMES: ReviewOutcomeConfig[] = [
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

export function getReviewButtonClassName(className: string) {
  return `${className} !min-w-0 flex-1 !px-1.5 !py-2 text-[0.8rem] leading-none sm:!min-w-[104px] sm:flex-none sm:!px-4 sm:!py-2 sm:text-sm`
}