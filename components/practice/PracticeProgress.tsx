import { formatReviewDueStatus, getReviewIntervalDays } from "@/lib/review"

type PracticeProgressProps = {
  stage: number | null | undefined
  nextReviewDue?: string | null
  className?: string
}

export default function PracticeProgress({
  stage,
  nextReviewDue,
  className = "",
}: PracticeProgressProps) {
  const intervalDays = getReviewIntervalDays(stage)

  return (
    <div className={`border-l-2 border-state-practice pl-3 ${className}`}>
      <p className="text-sm font-semibold text-foreground">
        {intervalDays}-day review
      </p>
      {nextReviewDue !== undefined ? <p className="mt-1 text-xs leading-5 text-muted-foreground">{formatReviewDueStatus(nextReviewDue)}</p> : null}
    </div>
  )
}
