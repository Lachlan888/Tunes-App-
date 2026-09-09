"use client"

import Link from "next/link"
import { useState } from "react"
import ActivityReactionBar from "@/components/activity/ActivityReactionBar"
import ActivityReplyForm from "@/components/activity/ActivityReplyForm"
import ResponsiveModal from "@/components/ui/ResponsiveModal"
import {
  formatFriendActivityRelativeTime,
  getActivityContextHref,
  renderFriendActivityText,
  type FriendActivityItem,
} from "@/lib/friend-activity"

type SocialActivityFeedProps = {
  items: FriendActivityItem[]
  redirectTo: string
  emptyMessage?: string
  limit?: number
}

function replyAuthor(item: FriendActivityItem["replies"][number]) {
  return item.author?.display_name || item.author?.username || "Unknown player"
}

function totalReactions(item: FriendActivityItem) {
  return item.reactions.reduce((sum, reaction) => sum + reaction.count, 0)
}

export default function SocialActivityFeed({
  items,
  redirectTo,
  emptyMessage = "No recent friend activity yet.",
  limit,
}: SocialActivityFeedProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const visibleItems = typeof limit === "number" ? items.slice(0, limit) : items
  const selectedItem = visibleItems.find((item) => item.id === selectedId) ?? null

  if (visibleItems.length === 0) {
    return (
      <p className="border-y border-dashed border-border py-4 text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    )
  }

  return (
    <>
      <ol className="divide-y divide-border border-y border-border">
        {visibleItems.map((item) => {
          const reactionCount = totalReactions(item)
          const commentCount = item.replies.length

          return (
            <li key={item.activity_key} className="py-4">
              <article className="border-l-4 border-state-social pl-3">
                <p className="text-sm leading-6 text-foreground">
                  {renderFriendActivityText(item)}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-muted-foreground">
                  <time dateTime={item.created_at}>
                    {formatFriendActivityRelativeTime(item.created_at)}
                  </time>
                  <span aria-label={`${reactionCount} reactions`}>
                    ♫ {reactionCount}
                  </span>
                  <span>
                    {commentCount} comment{commentCount === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className="inline-flex min-h-11 items-center text-sm font-semibold text-state-social underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                  >
                    {commentCount > 0 ? "Open discussion" : "React or comment"}
                  </button>
                  <Link
                    href={getActivityContextHref(item)}
                    className="inline-flex min-h-11 items-center text-sm font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Open context
                  </Link>
                </div>
              </article>
            </li>
          )
        })}
      </ol>

      {selectedItem ? (
        <ResponsiveModal
          isOpen
          onClose={() => setSelectedId(null)}
          eyebrow="Friend activity"
          title="Discussion"
          mobileMode="sheet"
          desktopMaxWidth="md:max-w-lg"
        >
          <div className="space-y-5">
            <div className="border-l-4 border-state-social pl-3 text-sm leading-6">
              {renderFriendActivityText(selectedItem)}
            </div>

            <ActivityReactionBar
              activityEventId={selectedItem.id}
              reactions={selectedItem.reactions}
              redirectTo={redirectTo}
            />

            {selectedItem.replies.length > 0 ? (
              <ol className="divide-y divide-border border-y border-border">
                {selectedItem.replies.map((reply) => (
                  <li key={reply.id} className="py-3 text-sm">
                    <p className="whitespace-pre-wrap leading-6">{reply.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {replyAuthor(reply)} · {formatFriendActivityRelativeTime(reply.created_at)}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">No comments yet.</p>
            )}

            <ActivityReplyForm
              activityEventId={selectedItem.id}
              redirectTo={redirectTo}
              isCommentActivity={selectedItem.event_type === "comment_added"}
            />
          </div>
        </ResponsiveModal>
      ) : null}
    </>
  )
}
