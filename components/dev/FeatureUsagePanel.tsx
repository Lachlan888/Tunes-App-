import type { DevFeatureUsageRow } from "@/lib/types"

type FeatureUsagePanelProps = {
  rows: DevFeatureUsageRow[]
}

function formatDate(value: string | null) {
  if (!value) return "Never"

  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value))
}

function formatEventType(value: string) {
  return value.replaceAll("_", " ")
}

export default function FeatureUsagePanel({ rows }: FeatureUsagePanelProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
        No usage events yet.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-left text-sm">
          <thead className="border-b border-border bg-background/70 text-xs uppercase tracking-[0.14em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Feature/event</th>
              <th className="px-4 py-3 font-semibold">Count</th>
              <th className="px-4 py-3 font-semibold">Unique users</th>
              <th className="px-4 py-3 font-semibold">Last seen</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.eventType} className="border-b border-border/70">
                <td className="px-4 py-3 font-medium">
                  {formatEventType(row.eventType)}
                </td>
                <td className="px-4 py-3">{row.count}</td>
                <td className="px-4 py-3">{row.uniqueUsers}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(row.lastSeen)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}