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
    <section className="md:rounded-2xl md:border md:border-border md:bg-card md:p-5 md:shadow-sm">
      <div className="mb-4 md:mb-5">
        <h2 className="text-xl font-semibold tracking-tight text-foreground md:mt-2 md:font-serif md:text-3xl md:font-bold">
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
