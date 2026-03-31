"use client"

import Link from "next/link"
import { useState } from "react"

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

export default function FriendsListSection({
  friends,
}: FriendsListSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const visibleFriends = isExpanded
    ? friends
    : friends.slice(0, DEFAULT_VISIBLE_COUNT)

  const hasOverflow = friends.length > DEFAULT_VISIBLE_COUNT

  return (
    <section className="mb-10 rounded border p-4">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Friends</h2>

        {hasOverflow && (
          <button
            type="button"
            onClick={() => setIsExpanded((value) => !value)}
            className="rounded border px-3 py-2 text-sm"
          >
            {isExpanded ? "Show less" : `Show all (${friends.length})`}
          </button>
        )}
      </div>

      {friends.length === 0 ? (
        <p className="text-sm text-gray-600">No friends yet.</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {visibleFriends.map((friend) => (
            <div
              key={friend.connection_id}
              className="min-w-[220px] flex-1 rounded border p-3"
            >
              <p className="font-medium">
                {friend.display_name || friend.username || "Unnamed user"}
              </p>

              {friend.username && (
                <p className="mt-1 text-sm text-gray-600">
                  <Link
                    href={`/users/${friend.username}`}
                    className="underline"
                  >
                    @{friend.username}
                  </Link>
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}