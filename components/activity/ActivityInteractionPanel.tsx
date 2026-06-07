import Link from "next/link"
import SubmitButton from "@/components/SubmitButton"
import ActivityReactionBar from "@/components/activity/ActivityReactionBar"
import ActivityReplyForm from "@/components/activity/ActivityReplyForm"
import { buttonStyles } from "@/components/ui/buttonStyles"
import {
  deleteActivityReply,
  updateActivityReply,
} from "@/lib/actions/activity-interactions"
import {
  formatFriendActivityRelativeTime,
  type FriendActivityItem,
} from "@/lib/friend-activity"
import { createClient } from "@/lib/supabase/server"

type ActivityInteractionPanelProps = {
  item: FriendActivityItem
  redirectTo: string
}

function getAuthorName(reply: FriendActivityItem["replies"][number]) {
  return reply.author?.display_name || reply.author?.username || "Unknown player"
}

export default async function ActivityInteractionPanel({
  item,
  redirectTo,
}: ActivityInteractionPanelProps) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const currentUserId = user?.id ?? null
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
          {item.replies.map((reply) => {
            const canManageReply =
              currentUserId !== null && reply.author?.id === currentUserId

            return (
              <div
                key={reply.id}
                className="rounded-2xl border border-border bg-muted/70 p-3 text-sm"
              >
                <p className="whitespace-pre-wrap leading-6 text-foreground">
                  {reply.body}
                </p>

                <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-muted-foreground">
                  <p>
                    {reply.author?.username ? (
                      <Link
                        href={`/users/${encodeURIComponent(
                          reply.author.username
                        )}`}
                        className="underline underline-offset-4 hover:text-foreground"
                      >
                        {getAuthorName(reply)}
                      </Link>
                    ) : (
                      getAuthorName(reply)
                    )}{" "}
                    · {formatFriendActivityRelativeTime(reply.created_at)}
                  </p>

                  {canManageReply ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <details className="rounded-full border border-border bg-background/70 px-3 py-1">
                        <summary className="cursor-pointer list-none text-xs font-medium text-muted-foreground hover:text-foreground">
                          Edit
                        </summary>

                        <form
                          action={updateActivityReply}
                          className="mt-3 min-w-64 space-y-2"
                        >
                          <input
                            type="hidden"
                            name="activity_reply_id"
                            value={reply.id}
                          />
                          <input
                            type="hidden"
                            name="redirect_to"
                            value={redirectTo}
                          />

                          <textarea
                            name="body"
                            rows={3}
                            defaultValue={reply.body}
                            required
                            className="w-full rounded-2xl border border-border bg-background/90 px-3 py-2 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"
                          />

                          <SubmitButton
                            label="Save edit"
                            pendingLabel="Saving..."
                            className={buttonStyles.primary}
                          />
                        </form>
                      </details>

                      <form action={deleteActivityReply}>
                        <input
                          type="hidden"
                          name="activity_reply_id"
                          value={reply.id}
                        />
                        <input
                          type="hidden"
                          name="redirect_to"
                          value={redirectTo}
                        />

                        <SubmitButton
                          label="Delete"
                          pendingLabel="Deleting..."
                          className={buttonStyles.destructiveSecondary}
                        />
                      </form>
                    </div>
                  ) : null}
                </div>
              </div>
            )
          })}
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
