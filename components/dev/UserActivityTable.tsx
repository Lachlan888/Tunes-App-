import type { DevUserActivityRow } from "@/lib/types"

type UserActivityTableProps = {
  rows: DevUserActivityRow[]
}

function formatDate(value: string | null) {
  if (!value) return "Never"

  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

function getUserLabel(row: DevUserActivityRow) {
  return row.displayName || row.username || row.email || row.userId
}

export default function UserActivityTable({ rows }: UserActivityTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
        No users found.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
          <thead className="border-b border-border bg-background/70 text-xs uppercase tracking-[0.14em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">User</th>
              <th className="px-4 py-3 font-semibold">Joined</th>
              <th className="px-4 py-3 font-semibold">Last active</th>
              <th className="px-4 py-3 font-semibold">Known</th>
              <th className="px-4 py-3 font-semibold">Practice</th>
              <th className="px-4 py-3 font-semibold">Lists</th>
              <th className="px-4 py-3 font-semibold">Reviews</th>
              <th className="px-4 py-3 font-semibold">Feedback</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.userId} className="border-b border-border/70">
                <td className="px-4 py-3">
                  <p className="font-medium">{getUserLabel(row)}</p>
                  {row.username ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      @{row.username}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(row.joinedAt)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(row.lastActiveAt)}
                </td>
                <td className="px-4 py-3">{row.knownTuneCount}</td>
                <td className="px-4 py-3">{row.practiceTuneCount}</td>
                <td className="px-4 py-3">{row.listCount}</td>
                <td className="px-4 py-3">{row.reviewCount}</td>
                <td className="px-4 py-3">{row.feedbackCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}