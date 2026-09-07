type TuneStateIndicatorProps = {
  isAlreadyInPractice?: boolean
  isKnown?: boolean
  stage?: number | null
  showNewToMe?: boolean
  className?: string
}

export default function TuneStateIndicator({
  isAlreadyInPractice = false,
  isKnown = false,
  stage = null,
  showNewToMe = false,
  className = "flex flex-wrap items-center gap-2",
}: TuneStateIndicatorProps) {
  const labels: Array<{ label: string; tone: StatusTone }> = []

  if (isAlreadyInPractice) {
    labels.push({
      label: "Already in practice",
      tone: "practice",
    })

    if (stage) {
      labels.push({ label: `Stage ${stage}`, tone: "stage" })
    }
  } else if (isKnown) {
    labels.push({
      label: "Known",
      tone: "known",
    })
  } else if (showNewToMe) {
    labels.push({
      label: "New to me",
      tone: "neutral",
    })
  }

  if (labels.length === 0) return null

  return (
    <div className={className}>
      {labels.map((item) => (
        <StatusMark key={item.label} tone={item.tone}>
          {item.label}
        </StatusMark>
      ))}
    </div>
  )
}
import StatusMark, { type StatusTone } from "@/components/ui/StatusMark"
