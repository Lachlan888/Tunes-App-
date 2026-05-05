import SubmitButton from "@/components/SubmitButton"
import { addActivityReply } from "@/lib/actions/activity-interactions"

type ActivityReplyFormProps = {
  activityEventId: number
  redirectTo: string
  isCommentActivity: boolean
}

export default function ActivityReplyForm({
  activityEventId,
  redirectTo,
  isCommentActivity,
}: ActivityReplyFormProps) {
  return (
    <form action={addActivityReply} className="mt-3 space-y-2">
      <input type="hidden" name="activity_event_id" value={activityEventId} />
      <input type="hidden" name="redirect_to" value={redirectTo} />

      <textarea
        name="body"
        rows={3}
        placeholder={
          isCommentActivity
            ? "Reply to this tune comment"
            : "Reply to this activity"
        }
        className="w-full rounded-2xl border border-border bg-background/70 px-3 py-2 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"
        required
      />

      <SubmitButton
        label={isCommentActivity ? "Reply to comment" : "Reply"}
        pendingLabel="Posting..."
        className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
      />
    </form>
  )
}