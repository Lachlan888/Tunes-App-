import { getReviewIntervalDays } from "@/lib/review"

type PracticeProgressProps = {
  stage: number | null | undefined
  className?: string
}

export default function PracticeProgress({
  stage,
  className = "",
}: PracticeProgressProps) {
  const safeStage = Math.min(Math.max(stage ?? 1, 1), 10)
  const intervalDays = getReviewIntervalDays(stage)

  return (
    <div className={`border-l-2 border-state-practice pl-3 ${className}`}>
      <p className="text-sm font-semibold text-foreground">
        Stage {safeStage} <span aria-hidden="true">·</span>{" "}
        {intervalDays}-day review
      </p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        This stage sets the interval after the next review result.
      </p>
    </div>
  )
}
