import EmptyState from "@/components/EmptyState"
import {
  formatFriendActivityRelativeTime,
  renderFriendActivityText,
  type FriendActivityItem,
} from "@/lib/friend-activity"

type RecentFriendActivitySectionProps = {
  items: FriendActivityItem[]
}

export default function RecentFriendActivitySection({
  items,
}: RecentFriendActivitySectionProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Social
        </p>
        <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground">
          Recent activity
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          A quiet preview of public activity from musicians you are connected
          with.
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No recent friend activity"
          description="Once you have friends, recent public practice and list activity can appear here."
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-border bg-background/70 p-4 shadow-sm"
            >
              <p className="text-sm leading-6 text-foreground">
                {renderFriendActivityText(item)}
              </p>
              <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {formatFriendActivityRelativeTime(item.created_at)}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}