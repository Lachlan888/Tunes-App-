import Link from "next/link"
import SocialActivityFeed from "@/components/activity/SocialActivityFeed"
import type { FriendActivityItem } from "@/lib/friend-activity"

type HomeFriendsActivityBoxProps = {
  items: FriendActivityItem[]
}

export default function HomeFriendsActivityBox({
  items,
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
          className="rounded-full border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
        >
          View all
        </Link>
      </div>

      <SocialActivityFeed items={items} redirectTo="/" limit={5} />
    </section>
  )
}
