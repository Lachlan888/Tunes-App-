import { buttonStyles } from "@/components/ui/buttonStyles"
import { markFailed, markShaky, markSolid } from "@/lib/actions/reviews"

export type ReviewOutcome = "failed" | "shaky" | "solid"

export type ReviewOutcomeConfig = {
  outcome: ReviewOutcome
  label: string
  modalTitle: string
  action: (formData: FormData) => Promise<void>
  className: string
  tooltip: string
}

export const REVIEW_OUTCOMES: ReviewOutcomeConfig[] = [
  {
    outcome: "failed",
    label: "Rough",
    modalTitle: "Rough review note",
    action: markFailed,
    className: buttonStyles.reviewRough,
    tooltip:
      "Use Rough when you could not recall the tune reliably. It comes back sooner.",
  },
  {
    outcome: "shaky",
    label: "Shaky",
    modalTitle: "Shaky review note",
    action: markShaky,
    className: buttonStyles.reviewShaky,
    tooltip:
      "Use Shaky when you got through it, but it felt uncertain. It repeats the current Stage.",
  },
  {
    outcome: "solid",
    label: "Solid",
    modalTitle: "Solid review note",
    action: markSolid,
    className: buttonStyles.reviewSolid,
    tooltip:
      "Use Solid when recall felt clean and confident. It moves forward to the next Stage.",
  },
]

export function getReviewButtonClassName(className: string) {
  return `${className} !min-w-0 flex-1 !px-1.5 !py-2 text-[0.8rem] leading-none sm:!min-w-[104px] sm:flex-none sm:!px-4 sm:!py-2 sm:text-sm`
}