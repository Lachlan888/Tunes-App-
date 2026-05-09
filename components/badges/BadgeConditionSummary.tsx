type BadgeConditionSummaryProps = {
  summary: string
}

export default function BadgeConditionSummary({
  summary,
}: BadgeConditionSummaryProps) {
  return (
    <div className="rounded-2xl border border-border bg-background/70 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Unlock condition
      </h3>
      <p className="mt-3 text-sm leading-6 text-foreground">{summary}</p>
    </div>
  )
}