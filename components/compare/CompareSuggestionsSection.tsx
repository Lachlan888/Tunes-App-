import PendingLinkButton from "@/components/PendingLinkButton"
import type { CompareSuggestion } from "@/lib/loaders/compare"
import { buildCompareHref } from "@/lib/compare-page"

type CompareSuggestionsSectionProps = {
  compareSuggestions: CompareSuggestion[]
  filterPreservedUsers: string[]
}

function getFriendDisplayName(friend: CompareSuggestion) {
  return friend.display_name || friend.username || "Unnamed player"
}

export default function CompareSuggestionsSection({
  compareSuggestions,
  filterPreservedUsers,
}: CompareSuggestionsSectionProps) {
  if (compareSuggestions.length === 0) {
    return null
  }

  return (
    <section className="mb-8 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Add a friend
      </h2>

      <p className="mt-3 text-sm text-muted-foreground md:text-base">
        Quick suggestions from your accepted friends.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
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
              className="rounded-2xl border border-border bg-background/70 p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-base font-semibold text-foreground">
                  {getFriendDisplayName(friend)}
                </p>

                <PendingLinkButton
                  href={buildCompareHref(nextUsers)}
                  label={alreadySelected ? "Already added" : "Add to compare"}
                  pendingLabel="Loading..."
                  className={
                    alreadySelected
                      ? "rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                      : "rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                  }
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}