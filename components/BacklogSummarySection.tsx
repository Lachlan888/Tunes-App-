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
          {groups.map((group) => {
            const rowContent = (
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">{group.label}</span>
                <span className="text-sm text-gray-600">{group.count}</span>
              </div>
            )

            return (
              <li key={group.tier}>
                {actionHref ? (
                  <Link
                    href={actionHref}
                    className="group block rounded border px-3 py-2 transition hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black/10"
                  >
                    {rowContent}
                  </Link>
                ) : (
                  <div className="rounded border px-3 py-2">{rowContent}</div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}