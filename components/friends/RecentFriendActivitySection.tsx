import SocialActivityFeed from "@/components/activity/SocialActivityFeed"
import type { FriendActivityItem } from "@/lib/friend-activity"

type RecentFriendActivitySectionProps = {
  items: FriendActivityItem[]
  nextCursor: string | null
}

export default function RecentFriendActivitySection({
  items,
  nextCursor,
}: RecentFriendActivitySectionProps) {
  return (
    <section className="border-t border-hairline pt-6">
      <div className="mb-4 md:mb-5">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Recent activity
        </h2>
        <p className="mt-2 hidden text-sm leading-6 text-muted-foreground md:block">
          Activity from your friends. React, comment, or open the tune.
        </p>
      </div>

      <SocialActivityFeed
        items={items}
        initialNextCursor={nextCursor}
        redirectTo="/friends"
        scrollRegionLabel="Friend activity feed"
      />
    </section>
  )
}
