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
        <span className="text-gray-600">Progress</span>
        <span className="font-medium">{progress}%</span>
      </div>

      <div
        className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200"
        aria-hidden="true"
      >
        <div
          className="h-full rounded-full bg-black transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}