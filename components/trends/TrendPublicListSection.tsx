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
      <p className="border-y border-border py-4 text-sm text-muted-foreground">
        No public lists found for this style yet.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-border border-y border-border">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className="grid gap-3 py-4 sm:grid-cols-[1fr_auto] sm:items-center"
        >
          <div>
            <div className="font-semibold text-foreground">{entry.name}</div>
            <p className="mt-1 text-sm text-muted-foreground">
              By {entry.ownerUsername ?? "Unknown player"} · {entry.matchingTuneCount}{" "}
              matching tune{entry.matchingTuneCount === 1 ? "" : "s"}
            </p>
            {entry.description ? (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {entry.description}
              </p>
            ) : null}
          </div>
          <div>
            <PendingLinkButton
              href={`/public-lists/${entry.id}`}
              label="View list"
              pendingLabel="Opening..."
              className="inline-flex min-h-11 items-center rounded-control border border-border px-4 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] justify-center"
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
