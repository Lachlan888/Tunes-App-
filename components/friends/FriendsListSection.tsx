"use client"

import Link from "next/link"
import { useState } from "react"
import EmptyState from "@/components/EmptyState"

type AcceptedFriend = {
  connection_id: number
  user_id: string
  username: string | null
  display_name: string | null
  accepted_at: string | null
}

type FriendsListSectionProps = {
  friends: AcceptedFriend[]
}

const DEFAULT_VISIBLE_COUNT = 4

const secondaryButtonClass =
  "rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"

export default function FriendsListSection({ friends }: FriendsListSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const visibleFriends = isExpanded
    ? friends
    : friends.slice(0, DEFAULT_VISIBLE_COUNT)

  const hasOverflow = friends.length > DEFAULT_VISIBLE_COUNT

  return (
    <section className="mb-8 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Connections
          </p>
          <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground">
            Friends
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Musicians you are connected with for repertoire comparison and
            relevant activity.
          </p>
        </div>

        {hasOverflow && (
          <button
            type="button"
            onClick={() => setIsExpanded((value) => !value)}
            className={secondaryButtonClass}
          >
            {isExpanded ? "Show less" : `Show all (${friends.length})`}
          </button>
        )}
      </div>

      {friends.length === 0 ? (
        <EmptyState
          title="No friends yet"
          description="Search for another user, send a request, and then compare your repertoire once connected."
          primaryActionHref="/friends"
          primaryActionLabel="Search users"
          secondaryActionHref="/compare"
          secondaryActionLabel="Compare tunes"
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visibleFriends.map((friend) => {
            const label = friend.display_name || friend.username || "Unnamed user"

            return (
              <article
                key={friend.connection_id}
                className="rounded-2xl border border-border bg-background/70 p-4 shadow-sm transition hover:bg-muted/70"
              >
                <p className="font-medium text-foreground">
                  {friend.username ? (
                    <Link
                      href={`/users/${friend.username}`}
                      className="decoration-primary decoration-2 underline-offset-4 hover:underline"
                    >
                      {label}
                    </Link>
                  ) : (
                    label
                  )}
                </p>

                {friend.username && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    <Link
                      href={`/users/${friend.username}`}
                      className="underline underline-offset-4 transition hover:text-foreground"
                    >
                      @{friend.username}
                    </Link>
                  </p>
                )}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}