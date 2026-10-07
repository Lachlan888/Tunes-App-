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
      <div className="border-y border-hairline py-6 text-sm text-muted-foreground">
        No usage events yet.
      </div>
    )
  }

  return (
    <>
      <ul className="divide-y divide-hairline border-y border-hairline md:hidden">
        {rows.map((row) => (
          <li key={row.eventType} className="py-4">
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-medium">{formatEventType(row.eventType)}</span>
              <span className="shrink-0 font-semibold tabular-nums">{row.count}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {row.uniqueUsers} unique {row.uniqueUsers === 1 ? "user" : "users"} · Last seen {formatDate(row.lastSeen)}
            </p>
          </li>
        ))}
      </ul>
      <div className="hidden border-y border-hairline md:block">
        <table className="w-full min-w-[680px] border-collapse text-left text-sm">
          <thead className="border-b border-border bg-background/70 text-xs  tracking-[0.14em] text-muted-foreground">
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
    </>
  )
}
