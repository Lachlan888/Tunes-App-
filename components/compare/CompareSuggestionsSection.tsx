"use client"

import PendingLinkButton from "@/components/PendingLinkButton"
import UserIdentityLink from "@/components/UserIdentityLink"
import type { CompareSuggestion } from "@/lib/loaders/compare"
import { addConfirmedCompareUser, buildCompareHref } from "@/lib/compare-page"

type CompareSuggestionsSectionProps = {
  compareSuggestions: CompareSuggestion[]
  filterPreservedUsers: string[]
  includePractice: boolean
}

function SuggestionCard({
  friend,
  filterPreservedUsers,
  includePractice,
}: {
  friend: CompareSuggestion
  filterPreservedUsers: string[]
  includePractice: boolean
}) {
  const label = friend.display_name || friend.username || "Unnamed player"

  const alreadySelected = filterPreservedUsers.some(
    (user) => user.toLowerCase() === friend.username.toLowerCase()
  )

  const nextUsers = addConfirmedCompareUser(filterPreservedUsers, friend.username)

  return (
    <article
      className="rounded-2xl border border-border bg-background/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:bg-muted/70 hover:shadow-md focus-within:ring-2 focus-within:ring-[var(--focus-ring)]"

      aria-label={`Open profile for ${label}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-base font-semibold text-foreground">
            <UserIdentityLink
              username={friend.username}
              displayName={friend.display_name}
              fallbackLabel="Unnamed player"
              className="decoration-primary decoration-2 underline-offset-4 hover:underline"
            />
          </p>

          <p className="mt-1">
            <UserIdentityLink
              username={friend.username}
              displayName={friend.display_name}
              showHandle
            />
          </p>
        </div>

        <div data-card-action>
          <PendingLinkButton
            href={buildCompareHref(nextUsers, { includePractice })}
            label={alreadySelected ? "Already added" : "Add to compare"}
            pendingLabel="Loading..."
            refresh
            className={
              alreadySelected
                ? "inline-flex min-h-11 rounded-control border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] items-center justify-center"
                : "inline-flex min-h-11 rounded-control border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] items-center justify-center"
            }
          />
        </div>
      </div>
    </article>
  )
}

export default function CompareSuggestionsSection({
  compareSuggestions,
  filterPreservedUsers,
  includePractice,
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
        {compareSuggestions.map((friend) => (
          <SuggestionCard
            key={friend.user_id}
            friend={friend}
            filterPreservedUsers={filterPreservedUsers}
            includePractice={includePractice}
          />
        ))}
      </div>
    </section>
  )
}
