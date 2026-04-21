import Link from "next/link"
import PendingLinkButton from "@/components/PendingLinkButton"
import type { CompareSuggestion } from "@/lib/loaders/compare"
import { buildCompareHref, renderProfileLink } from "@/lib/compare-page"

type CompareSuggestionsSectionProps = {
  compareSuggestions: CompareSuggestion[]
  filterPreservedUsers: string[]
}

export default function CompareSuggestionsSection({
  compareSuggestions,
  filterPreservedUsers,
}: CompareSuggestionsSectionProps) {
  if (compareSuggestions.length === 0) {
    return null
  }

  return (
    <section className="mb-8 rounded border p-4">
      <h2 className="text-xl font-semibold">Add a friend</h2>
      <p className="mt-1 text-sm text-gray-600">
        Quick suggestions from your accepted friends.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {compareSuggestions.map((friend) => {
          const alreadySelected = filterPreservedUsers.some(
            (user) => user.toLowerCase() === friend.username.toLowerCase()
          )

          const nextUsers = alreadySelected
            ? filterPreservedUsers
            : [...filterPreservedUsers, friend.username]

          return (
            <div
              key={friend.user_id}
              className="rounded border border-gray-200 p-4"
            >
              <p className="font-medium">
                {renderProfileLink(
                  friend.username,
                  friend.display_name || friend.username
                )}
              </p>

              <p className="mt-1 text-sm text-gray-600">
                <Link
                  href={`/users/${friend.username}`}
                  className="underline hover:no-underline"
                >
                  @{friend.username}
                </Link>
              </p>

              <div className="mt-3">
                <PendingLinkButton
                  href={buildCompareHref(nextUsers)}
                  label={alreadySelected ? "Already added" : "Add to compare"}
                  pendingLabel="Loading..."
                  className="rounded bg-black px-4 py-2 text-sm text-white"
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}