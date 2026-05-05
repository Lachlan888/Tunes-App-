import OptimisticActivityReactionButton from "@/components/activity/OptimisticActivityReactionButton"
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

  const initialIsActive = Boolean(reaction?.user_has_reacted)
  const initialCount = reaction?.count ?? 0
  const label = ACTIVITY_REACTION_LABELS[reactionType]

  return (
    <div className="flex flex-wrap gap-2">
      <OptimisticActivityReactionButton
        activityEventId={activityEventId}
        reactionType={reactionType}
        label={label}
        initialIsActive={initialIsActive}
        initialCount={initialCount}
        redirectTo={redirectTo}
      />
    </div>
  )
}