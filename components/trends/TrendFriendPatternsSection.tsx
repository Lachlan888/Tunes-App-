import PendingLinkButton from "@/components/PendingLinkButton"
import type { FriendPatternEntry } from "@/lib/loaders/trends"

type TrendFriendPatternsSectionProps = {
  friendCount: number
  styleEntries: FriendPatternEntry[]
  keyEntries: FriendPatternEntry[]
}

export default function TrendFriendPatternsSection({
  friendCount,
  styleEntries,
  keyEntries,
}: TrendFriendPatternsSectionProps) {
  if (friendCount === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground shadow-sm">
        <p className="mb-4">
          You do not have any accepted friends yet.
        </p>
        <PendingLinkButton
          href="/friends"
          label="Find friends"
          pendingLabel="Opening..."
          className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
        />
      </div>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Styles your friends play
        </h3>

        {styleEntries.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No style patterns found yet.
          </p>
        ) : (
          <ul className="mt-5 space-y-3">
            {styleEntries.map((entry) => (
              <li
                key={entry.label}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background/70 p-4"
              >
                <div>
                  <p className="font-semibold text-foreground">{entry.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {entry.count} friend{entry.count === 1 ? "" : "s"}
                  </p>
                </div>

                {entry.href ? (
                  <PendingLinkButton
                    href={entry.href}
                    label="View"
                    pendingLabel="Opening..."
                    className="rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                  />
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Keys your friends play
        </h3>

        {keyEntries.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No key patterns found yet.
          </p>
        ) : (
          <ul className="mt-5 space-y-3">
            {keyEntries.map((entry) => (
              <li
                key={entry.label}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background/70 p-4"
              >
                <p className="font-semibold text-foreground">{entry.label}</p>
                <p className="text-sm text-muted-foreground">
                  {entry.count} friend{entry.count === 1 ? "" : "s"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}