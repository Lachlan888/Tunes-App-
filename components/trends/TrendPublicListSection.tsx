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
      <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
        No public lists found for this style yet.
      </div>
    )
  }

  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {entries.map((entry) => (
        <li key={entry.id} className="rounded border p-4">
          <div className="mb-1 text-lg font-semibold">{entry.name}</div>

          <p className="mb-2 text-sm text-gray-600">
            By {entry.ownerUsername ?? "Unknown user"}
          </p>

          {entry.description && (
            <p className="mb-3 text-sm text-gray-700">{entry.description}</p>
          )}

          <p className="mb-3 text-sm text-gray-600">
            {entry.matchingTuneCount} matching tune
            {entry.matchingTuneCount === 1 ? "" : "s"} in this style
          </p>

          <PendingLinkButton
            href={`/public-lists/${entry.id}`}
            label="View List"
            pendingLabel="Opening..."
            className="rounded border px-3 py-1 text-sm"
          />
        </li>
      ))}
    </ul>
  )
}