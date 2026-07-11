type TuneStateIndicatorProps = {
  isAlreadyInPractice?: boolean
  isKnown?: boolean
  stage?: number | null
  showNewToMe?: boolean
  className?: string
}

const basePillClass =
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]"

export default function TuneStateIndicator({
  isAlreadyInPractice = false,
  isKnown = false,
  stage = null,
  showNewToMe = false,
  className = "flex flex-wrap items-center gap-2",
}: TuneStateIndicatorProps) {
  const labels: Array<{ label: string; className: string }> = []

  if (isAlreadyInPractice) {
    labels.push({
      label: stage ? `Already in practice · Stage ${stage}` : "Already in practice",
      className: "border-success bg-success text-success-foreground",
    })
  } else if (isKnown) {
    labels.push({
      label: "Known",
      className: "border-border bg-background/70 text-muted-foreground",
    })
  } else if (showNewToMe) {
    labels.push({
      label: "New to me",
      className: "border-border bg-background/70 text-muted-foreground",
    })
  }

  if (labels.length === 0) return null

  return (
    <div className={className}>
      {labels.map((item) => (
        <span key={item.label} className={`${basePillClass} ${item.className}`}>
          {item.label}
        </span>
      ))}
    </div>
  )
}
