import Link from "next/link"
import SocialActivityFeed from "@/components/activity/SocialActivityFeed"
import type { FriendActivityItem } from "@/lib/friend-activity"

type HomeFriendsActivityBoxProps = {
  items: FriendActivityItem[]
  nextCursor: string | null
}

export default function HomeFriendsActivityBox({
  items,
  nextCursor,
}: HomeFriendsActivityBoxProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Friend activity
          </p>
        </div>

        <Link
          href="/friends"
          className="inline-flex min-h-11 rounded-control border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] items-center justify-center"
        >
          View all
        </Link>
      </div>

      <SocialActivityFeed
        items={items}
        initialNextCursor={nextCursor}
        redirectTo="/"
        scrollRegionLabel="Friend activity feed"
      />
    </section>
  )
}
