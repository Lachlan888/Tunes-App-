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
      <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
        <p className="mb-3">You do not have any accepted friends yet.</p>
        <PendingLinkButton
          href="/friends"
          label="Find friends"
          pendingLabel="Opening..."
          className="rounded border px-3 py-1 text-sm"
        />
      </div>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <h3 className="mb-3 text-lg font-semibold">Styles your friends play</h3>

        {styleEntries.length === 0 ? (
          <p className="text-sm text-zinc-600">No style patterns found yet.</p>
        ) : (
          <ul className="space-y-3">
            {styleEntries.map((entry) => (
              <li
                key={entry.label}
                className="flex items-center justify-between gap-3"
              >
                <div>
                  <p className="font-medium">{entry.label}</p>
                  <p className="text-sm text-zinc-600">
                    {entry.count} friend{entry.count === 1 ? "" : "s"}
                  </p>
                </div>

                {entry.href ? (
                  <PendingLinkButton
                    href={entry.href}
                    label="View"
                    pendingLabel="Opening..."
                    className="rounded border px-3 py-1 text-sm"
                  />
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <h3 className="mb-3 text-lg font-semibold">Keys your friends play</h3>

        {keyEntries.length === 0 ? (
          <p className="text-sm text-zinc-600">No key patterns found yet.</p>
        ) : (
          <ul className="space-y-3">
            {keyEntries.map((entry) => (
              <li
                key={entry.label}
                className="flex items-center justify-between gap-3"
              >
                <p className="font-medium">{entry.label}</p>
                <p className="text-sm text-zinc-600">
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