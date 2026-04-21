import Link from "next/link"
import type { BacklogGroupSummary } from "@/lib/types"

type BacklogSummarySectionProps = {
  groups: BacklogGroupSummary[]
  actionHref?: string
  actionLabel?: string
  heading?: string
  emptyMessage?: string
}

export default function BacklogSummarySection({
  groups,
  actionHref,
  actionLabel,
  heading = "Needs attention",
  emptyMessage = "Nothing overdue right now.",
}: BacklogSummarySectionProps) {
  const totalCount = groups.reduce((sum, group) => sum + group.count, 0)

  return (
    <section className="rounded-lg border p-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold">{heading}</h3>

        {actionHref && actionLabel && (
          <Link href={actionHref} className="text-sm underline">
            {actionLabel}
          </Link>
        )}
      </div>

      {totalCount === 0 ? (
        <p className="mt-3 text-sm text-gray-600">{emptyMessage}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {groups.map((group) => (
            <li
              key={group.tier}
              className="flex items-center justify-between rounded border px-3 py-2"
            >
              <span className="text-sm font-medium">{group.label}</span>
              <span className="text-sm text-gray-600">{group.count}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}