"use client"

import PendingLinkButton from "@/components/PendingLinkButton"
import UserIdentityLink from "@/components/UserIdentityLink"
import type { CompareSuggestion } from "@/lib/loaders/compare"
import { buildCompareHref } from "@/lib/compare-page"
import { getSuggestedCompareAction } from "@/lib/compare-suggestion-action"

type CompareSuggestionsSectionProps = {
  compareSuggestions: CompareSuggestion[]
  filterPreservedUsers: string[]
  includePractice: boolean
  titleQuery: string
  selectedKeys: string[]
  selectedStyles: string[]
  selectedTimeSignatures: string[]
  overlapGroup: "all" | "strong" | "shaky"
}

function SuggestionRow({
  friend,
  filterPreservedUsers,
  includePractice,
  titleQuery,
  selectedKeys,
  selectedStyles,
  selectedTimeSignatures,
  overlapGroup,
}: {
  friend: CompareSuggestion
  filterPreservedUsers: string[]
  includePractice: boolean
  titleQuery: string
  selectedKeys: string[]
  selectedStyles: string[]
  selectedTimeSignatures: string[]
  overlapGroup: "all" | "strong" | "shaky"
}) {
  const label = friend.display_name || friend.username || "Unnamed player"
  const action = getSuggestedCompareAction(
    filterPreservedUsers,
    friend.username
  )

  return (
    <article
      className="py-4 transition focus-within:ring-2 focus-within:ring-[var(--focus-ring)]"

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
            href={buildCompareHref(action.nextUsers, {
              q: titleQuery,
              key: selectedKeys,
              style: selectedStyles,
              time_signature: selectedTimeSignatures,
              includePractice,
              group: overlapGroup,
            })}
            label={action.label}
            ariaLabel={`${action.label} ${label}`}
            pendingLabel="Loading..."
            refresh
            disabled={action.disabled}
            className={
              action.disabled
                ? "inline-flex min-h-11 rounded-control border border-border bg-surface-paper px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] items-center justify-center"
                : "inline-flex min-h-11 rounded-control border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] items-center justify-center"
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
  titleQuery,
  selectedKeys,
  selectedStyles,
  selectedTimeSignatures,
  overlapGroup,
}: CompareSuggestionsSectionProps) {
  if (compareSuggestions.length === 0) {
    return null
  }

  return (
    <section className="mb-8 border-t border-hairline pt-5">
      <h2 className="text-xl font-semibold text-foreground">
        Add a friend
      </h2>

      <p className="mt-3 text-sm text-muted-foreground md:text-base">
        Quick suggestions from your accepted friends.
      </p>

      <div className="mt-4 divide-y divide-hairline border-y border-hairline">
        {compareSuggestions.map((friend) => (
          <SuggestionRow
            key={friend.user_id}
            friend={friend}
            filterPreservedUsers={filterPreservedUsers}
            includePractice={includePractice}
            titleQuery={titleQuery}
            selectedKeys={selectedKeys}
            selectedStyles={selectedStyles}
            selectedTimeSignatures={selectedTimeSignatures}
            overlapGroup={overlapGroup}
          />
        ))}
      </div>
    </section>
  )
}
