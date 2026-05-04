import Link from "next/link"
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
    <section className="rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold">Friend activity</h3>
        <Link href="/friends" className="text-sm underline">
          View all friend activity
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-600">No recent friend activity yet.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="rounded border p-3">
              <p className="text-sm">{renderFriendActivityText(item)}</p>
              <p className="mt-1 text-xs text-gray-500">
                {formatFriendActivityRelativeTime(item.created_at)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}