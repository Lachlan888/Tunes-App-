import { getProgressTowardsKnown } from "@/lib/review"

type PracticeProgressProps = {
  stage: number | null | undefined
  className?: string
}

export default function PracticeProgress({
  stage,
  className = "",
}: PracticeProgressProps) {
  const progress = getProgressTowardsKnown(stage)

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-muted-foreground">
          REVIEW PROGRESS
        </span>
        <span className="font-semibold text-foreground">{progress}%</span>
      </div>

      <div
        className="mt-2 h-3 w-full overflow-hidden rounded-full border border-border bg-background/80 shadow-inner"
        aria-hidden="true"
      >
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}