import PendingLinkButton from "@/components/PendingLinkButton"
import type { StyleTrendPublicListEntry } from "@/lib/loaders/trends"

type TrendPublicListSectionProps = {
  entries: StyleTrendPublicListEntry[]
}

export default function TrendPublicListSection({
  entries,
}: TrendPublicListSectionProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
        No public lists found for this style yet.
      </div>
    )
  }

  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className="rounded-2xl border border-border bg-background/70 p-5 shadow-sm"
        >
          <div className="text-lg font-semibold text-foreground">
            {entry.name}
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            By {entry.ownerUsername ?? "Unknown player"}
          </p>

          {entry.description && (
            <p className="mt-3 text-sm text-muted-foreground">
              {entry.description}
            </p>
          )}

          <p className="mt-4 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground">
            {entry.matchingTuneCount} matching tune
            {entry.matchingTuneCount === 1 ? "" : "s"} in this style
          </p>

          <div className="mt-4">
            <PendingLinkButton
              href={`/public-lists/${entry.id}`}
              label="View list"
              pendingLabel="Opening..."
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
