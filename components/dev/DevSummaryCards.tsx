import type { DevSummaryData } from "@/lib/types"

type DevSummaryCardsProps = {
  summary: DevSummaryData
}

function SummaryCard({
  label,
  value,
  helper,
}: {
  label: string
  value: string | number
  helper?: string | null
}) {
  return (
    <div className="rounded-2xl border border-border bg-background/70 p-4">
      <p className="font-serif text-4xl font-bold">{value}</p>
      <p className="mt-1 text-sm font-medium text-muted-foreground">{label}</p>
      {helper ? (
        <p className="mt-2 text-xs leading-5 text-muted-foreground">{helper}</p>
      ) : null}
    </div>
  )
}

export default function DevSummaryCards({ summary }: DevSummaryCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <SummaryCard label="Total users" value={summary.totalUsers} />
      <SummaryCard
        label="Active this week"
        value={summary.activeUsersThisWeek}
      />
      <SummaryCard label="Open feedback" value={summary.openFeedback} />
      <SummaryCard label="Launch blockers" value={summary.launchBlockers} />
      <SummaryCard label="Reviews this week" value={summary.reviewsThisWeek} />
      <SummaryCard
        label="Most reported page"
        value={summary.mostReportedPage ?? "None"}
        helper={`${summary.totalFeedback} feedback reports loaded`}
      />
    </div>
  )
}