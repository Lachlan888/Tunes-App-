import Link from "next/link"
import EmptyState from "@/components/EmptyState"
import ActivityInteractionPanel from "@/components/activity/ActivityInteractionPanel"
import {
  formatFriendActivityRelativeTime,
  getActivityContextHref,
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
    <section className="md:rounded-2xl md:border md:border-border md:bg-card md:p-5 md:shadow-sm">
      <div className="mb-4 md:mb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Social
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground md:font-serif md:text-3xl md:font-bold">
          Recent activity
        </h2>
        <p className="mt-2 hidden text-sm leading-6 text-muted-foreground md:block">
          Activity from musicians you are connected with. React, reply, or open
          the tune for more context.
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No recent friend activity"
          description="Once you have friends, recent public practice and list activity can appear here."
        />
      ) : (
        <div className="divide-y divide-border/70 md:space-y-3 md:divide-y-0">
          {items.map((item) => (
            <article
              key={item.id}
              className="py-4 transition hover:text-foreground md:rounded-2xl md:border md:border-border md:bg-background/70 md:p-4 md:shadow-sm md:hover:bg-muted/70"
            >
              <p className="text-sm leading-6 text-foreground">
                {renderFriendActivityText(item)}
              </p>

              <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {formatFriendActivityRelativeTime(item.created_at)}
                </p>

                <Link
                  href={getActivityContextHref(item)}
                  className="text-sm font-medium text-muted-foreground underline underline-offset-4 transition hover:text-foreground"
                >
                  Open context
                </Link>
              </div>

              <ActivityInteractionPanel item={item} redirectTo="/friends" />
            </article>
          ))}
        </div>
      )}
    </section>
  )
}