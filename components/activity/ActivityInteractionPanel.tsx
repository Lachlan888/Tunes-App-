import Link from "next/link"
import ActivityReactionBar from "@/components/activity/ActivityReactionBar"
import ActivityReplyForm from "@/components/activity/ActivityReplyForm"
import {
  formatFriendActivityRelativeTime,
  type FriendActivityItem,
} from "@/lib/friend-activity"

type ActivityInteractionPanelProps = {
  item: FriendActivityItem
  redirectTo: string
}

function getAuthorName(reply: FriendActivityItem["replies"][number]) {
  return (
    reply.author?.display_name || reply.author?.username || "Unknown user"
  )
}

export default function ActivityInteractionPanel({
  item,
  redirectTo,
}: ActivityInteractionPanelProps) {
  const isCommentActivity = item.event_type === "comment_added"

  return (
    <div className="mt-4 border-t border-border pt-4">
      <ActivityReactionBar
        activityEventId={item.id}
        reactions={item.reactions}
        redirectTo={redirectTo}
      />

      {item.replies.length > 0 && (
        <div className="mt-4 space-y-2">
          {item.replies.map((reply) => (
            <div
              key={reply.id}
              className="rounded-2xl border border-border bg-muted/70 p-3 text-sm"
            >
              <p className="whitespace-pre-wrap leading-6 text-foreground">
                {reply.body}
              </p>
              <p className="mt-2 text-xs font-medium text-muted-foreground">
                {reply.author?.username ? (
                  <Link
                    href={`/users/${reply.author.username}`}
                    className="underline underline-offset-4 hover:text-foreground"
                  >
                    {getAuthorName(reply)}
                  </Link>
                ) : (
                  getAuthorName(reply)
                )}{" "}
                · {formatFriendActivityRelativeTime(reply.created_at)}
              </p>
            </div>
          ))}
        </div>
      )}

      <ActivityReplyForm
        activityEventId={item.id}
        redirectTo={redirectTo}
        isCommentActivity={isCommentActivity}
      />
    </div>
  )
}