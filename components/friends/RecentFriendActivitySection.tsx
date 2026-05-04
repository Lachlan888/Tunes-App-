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
    <section className="rounded border p-4">
      <h2 className="mb-4 text-xl font-semibold">Recent activity</h2>

      {items.length === 0 ? (
        <EmptyState
          title="No recent friend activity"
          description="Once you have friends, recent public practice and list activity can appear here."
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="rounded border p-3">
              <p className="text-sm">{renderFriendActivityText(item)}</p>
              <p className="mt-1 text-xs text-gray-500">
                {formatFriendActivityRelativeTime(item.created_at)}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}