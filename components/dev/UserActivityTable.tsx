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
      <div className="border-y border-hairline py-6 text-sm text-muted-foreground">
        No users found.
      </div>
    )
  }

  return (
    <>
      <ul className="divide-y divide-hairline border-y border-hairline lg:hidden">
        {rows.map((row) => (
          <li key={row.userId} className="py-4">
            <p className="break-words font-medium">{getUserLabel(row)}</p>
            {row.username ? <p className="text-xs text-muted-foreground">@{row.username}</p> : null}
            <p className="mt-2 text-xs text-muted-foreground">
              Joined {formatDate(row.joinedAt)} · {row.lastActiveAt ? `Last active ${formatDate(row.lastActiveAt)}` : "No recorded activity"}
            </p>
            <dl className="mt-3 grid grid-cols-2 gap-x-5 gap-y-2 text-xs sm:grid-cols-3">
              {[
                ["Known", row.knownTuneCount],
                ["Practice", row.practiceTuneCount],
                ["Lists", row.listCount],
                ["Reviews", row.reviewCount],
                ["Feedback", row.feedbackCount],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-2 border-t border-hairline pt-1">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-semibold tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
      <div className="hidden border-y border-hairline lg:block">
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
          <thead className="border-b border-border bg-background/70 text-xs  tracking-[0.14em] text-muted-foreground">
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
    </>
  )
}
