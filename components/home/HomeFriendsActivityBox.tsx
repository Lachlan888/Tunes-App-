import Link from "next/link"
import ActivityInteractionPanel from "@/components/activity/ActivityInteractionPanel"
import {
  formatFriendActivityRelativeTime,
  renderFriendActivityText,
  type FriendActivityItem,
} from "@/lib/friend-activity"

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

      {items.length === 0 ? (
        <p className="rounded-xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
          No recent friend activity yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-border bg-background/70 p-4"
            >
              <p className="text-sm leading-6 text-foreground">
                {renderFriendActivityText(item)}
              </p>
              <p className="mt-2 text-xs font-medium text-muted-foreground">
                {formatFriendActivityRelativeTime(item.created_at)}
              </p>

              <ActivityInteractionPanel item={item} redirectTo="/" />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}