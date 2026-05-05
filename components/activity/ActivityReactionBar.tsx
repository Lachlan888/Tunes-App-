import SubmitButton from "@/components/SubmitButton"
import { toggleActivityReaction } from "@/lib/actions/activity-interactions"
import {
  ACTIVITY_REACTION_LABELS,
  type ActivityReactionSummary,
} from "@/lib/friend-activity"

type ActivityReactionBarProps = {
  activityEventId: number
  reactions: ActivityReactionSummary[]
  redirectTo: string
}

const reactionType = "good_craic"

export default function ActivityReactionBar({
  activityEventId,
  reactions,
  redirectTo,
}: ActivityReactionBarProps) {
  const reaction = reactions.find(
    (item) => item.reaction_type === reactionType
  )

  const isActive = Boolean(reaction?.user_has_reacted)
  const count = reaction?.count ?? 0
  const label = ACTIVITY_REACTION_LABELS[reactionType]

  return (
    <div className="flex flex-wrap gap-2">
      <form action={toggleActivityReaction}>
        <input
          type="hidden"
          name="activity_event_id"
          value={activityEventId}
        />
        <input type="hidden" name="reaction_type" value={reactionType} />
        <input type="hidden" name="redirect_to" value={redirectTo} />

        <SubmitButton
          label={`${label}${count > 0 ? ` ${count}` : ""}`}
          pendingLabel="Saving..."
          className={
            isActive
              ? "rounded-full border border-primary bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              : "rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          }
        />
      </form>
    </div>
  )
}