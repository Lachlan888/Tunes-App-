import HomeMobileSummarySwitcher from "@/components/home/HomeMobileSummarySwitcher"
import type { FriendActivityItem } from "@/lib/friend-activity"
import type { HomeSummaryData, StreakSummary } from "@/lib/types"

export default function HomeSummarySection(props: {
  summary: HomeSummaryData
  currentUserId: string
  recentFriendActivity: FriendActivityItem[]
  activityNextCursor: string | null
  streakSummary: StreakSummary
  leadingContent?: React.ReactNode
}) {
  return <HomeMobileSummarySwitcher {...props} density="standard" />
}
