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
  "inline-flex min-h-11 rounded-control border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground  transition hover:-translate-y-0.5 hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60 items-center justify-center"

function FriendRow({ friend }: { friend: AcceptedFriend }) {
  const label = friend.display_name || friend.username || "Unnamed player"
  const profileHref = friend.username
    ? `/users/${encodeURIComponent(friend.username)}`
    : null

  return (
    <article
      className={
        profileHref
          ? "px-1 py-4 transition hover:bg-surface-note/50 hover:text-foreground focus-within:ring-2 focus-within:ring-[var(--focus-ring)]"
          : "px-1 py-4 transition hover:bg-surface-note/50 hover:text-foreground"
      }

    >
      <p className="font-medium text-foreground">
        {profileHref ? (
          <Link
            href={profileHref}
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
            href={`/users/${encodeURIComponent(friend.username)}`}
            className="underline underline-offset-4 transition hover:text-foreground"
          >
            @{friend.username}
          </Link>
        </p>
      )}
    </article>
  )
}

export default function FriendsListSection({ friends }: FriendsListSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const visibleFriends = isExpanded
    ? friends
    : friends.slice(0, DEFAULT_VISIBLE_COUNT)

  const hasOverflow = friends.length > DEFAULT_VISIBLE_COUNT

  return (
    <section className="mb-8 border-t border-hairline pt-6">
      <div className="mb-4 flex items-start justify-between gap-4 md:mb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Friends
          </h2>
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
          description="Connect with a musician to compare repertoire."
          primaryActionHref="/friends"
          primaryActionLabel="Search people"
          secondaryActionHref="/compare"
          secondaryActionLabel="Compare tunes"
        />
      ) : (
        <div className="divide-y divide-hairline border-y border-hairline">
          {visibleFriends.map((friend) => (
            <FriendRow key={friend.connection_id} friend={friend} />
          ))}
        </div>
      )}
    </section>
  )
}
