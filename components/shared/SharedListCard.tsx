import PendingLinkButton from "@/components/PendingLinkButton"
import type { SharedList } from "@/lib/loaders/public-lists"

type SharedListCardProps = {
  list: SharedList
}

export default function SharedListCard({ list }: SharedListCardProps) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">{list.name}</h2>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
            <span>By {list.ownerLabel}</span>
            <span>
              {list.tuneCount} tune{list.tuneCount === 1 ? "" : "s"}
            </span>

            {list.isOwnedByCurrentUser && (
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                Your public list
              </span>
            )}
          </div>

          {list.description ? (
            <p className="mt-3 text-sm text-gray-800">{list.description}</p>
          ) : (
            <p className="mt-3 text-sm text-gray-500">No description yet.</p>
          )}
        </div>

        <div className="shrink-0">
          <PendingLinkButton
            href={`/public-lists/${list.id}`}
            label="Browse and import"
            pendingLabel="Loading..."
            className="inline-block rounded border px-3 py-2 text-sm font-medium"
          />
        </div>
      </div>
    </div>
  )
}