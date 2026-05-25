"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
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

function clickedInsideInteractiveElement(target: EventTarget | null) {
  if (!(target instanceof Element)) return false

  return Boolean(
    target.closest(
      [
        "a",
        "button",
        "input",
        "select",
        "textarea",
        "label",
        "summary",
        "details",
        "form",
        "[role='button']",
        "[data-card-action]",
      ].join(", ")
    )
  )
}

function FriendCard({ friend }: { friend: AcceptedFriend }) {
  const router = useRouter()
  const label = friend.display_name || friend.username || "Unnamed user"
  const profileHref = friend.username
    ? `/users/${encodeURIComponent(friend.username)}`
    : null

  function openProfile(event: React.MouseEvent<HTMLElement>) {
    if (!profileHref) return
    if (clickedInsideInteractiveElement(event.target)) return
    router.push(profileHref)
  }

  return (
    <article
      className={
        profileHref
          ? "cursor-pointer py-4 transition hover:text-foreground focus-within:ring-2 focus-within:ring-[var(--focus-ring)] md:rounded-2xl md:border md:border-border md:bg-background/70 md:p-4 md:shadow-sm md:hover:-translate-y-0.5 md:hover:bg-muted/70 md:hover:shadow-md"
          : "py-4 transition hover:text-foreground md:rounded-2xl md:border md:border-border md:bg-background/70 md:p-4 md:shadow-sm md:hover:bg-muted/70"
      }
      onClick={openProfile}
      aria-label={profileHref ? `Open profile for ${label}` : undefined}
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
    <section className="mb-7 md:mb-8 md:rounded-2xl md:border md:border-border md:bg-card md:p-5 md:shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4 md:mb-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Connections
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground md:font-serif md:text-3xl md:font-bold">
            Friends
          </h2>
          <p className="mt-2 hidden text-sm leading-6 text-muted-foreground md:block">
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
        <div className="divide-y divide-border/70 md:grid md:grid-cols-2 md:gap-3 md:divide-y-0 xl:grid-cols-3">
          {visibleFriends.map((friend) => (
            <FriendCard key={friend.connection_id} friend={friend} />
          ))}
        </div>
      )}
    </section>
  )
}