import Link from "next/link"
import SubmitButton from "@/components/SubmitButton"
import { archiveNotification, markNotificationRead } from "@/lib/actions/activity-interactions"
import type { InboxItem } from "@/lib/loaders/inbox"

function actorName(item: InboxItem) {
  return item.actor?.display_name || item.actor?.username || "Someone"
}

function contextHref(item: InboxItem) {
  if (item.activity_context?.href) return item.activity_context.href
  if (item.badge) return `/badges/${item.badge.slug}`
  if (item.setlist) return `/setlists/${item.setlist.id}`
  if (item.piece) return `/library/${item.piece.id}`
  if (item.learning_list) {
    return item.notification_type === "learning_list_shared"
      ? `/learning-lists/${item.learning_list.id}`
      : `/public-lists/${item.learning_list.id}`
  }
  if (item.actor?.username) return `/users/${item.actor.username}`
  return "/inbox"
}

function notificationText(item: InboxItem) {
  const actor = actorName(item)
  if (item.notification_type === "activity_reaction") return `${actor} reacted to your activity.`
  if (item.notification_type === "activity_reply") return `${actor} commented on your activity.`
  if (item.notification_type === "comment_reply") return `${actor} replied to your tune comment.`
  if (item.notification_type === "badge_awarded") return `${actor} awarded you ${item.badge?.name ?? "a badge"}.`
  if (item.notification_type === "composer_tune_started_practice") return `${actor} started practising ${item.piece?.title ?? "one of your tunes"}.`
  if (item.notification_type === "composer_attribution_added") return `You were credited as composer${item.piece ? ` of ${item.piece.title}` : ""}.`
  if (item.notification_type === "learning_list_shared") return `${actor} shared ${item.learning_list?.name ?? "a list"} with you.`
  if (item.notification_type === "setlist_invite") return `${actor} invited you to ${item.setlist?.name ?? "a setlist"}.`
  if (item.notification_type === "setlist_invite_accepted") return `${actor} joined ${item.setlist?.name ?? "a setlist"}.`
  if (item.notification_type === "piece_edit_request_approved") return `Your edit request${item.piece ? ` for ${item.piece.title}` : ""} was approved.`
  if (item.notification_type === "piece_edit_request_rejected") return `Your edit request${item.piece ? ` for ${item.piece.title}` : ""} was not approved.`
  if (item.setlist) return `${actor} updated ${item.setlist.name}.`
  return `${actor} sent you an update.`
}

export default function InboxItemList({
  items,
  emptyMessage,
}: {
  items: InboxItem[]
  emptyMessage: string
}) {
  if (items.length === 0) {
    return (
      <p className="border-y border-dashed border-border py-5 text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    )
  }

  return (
    <ol className="divide-y divide-border border-y border-border">
      {items.map((item) => {
        const isUnread = item.read_at === null
        return (
          <li key={item.id} className="py-4">
            <article className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className={`border-l-4 pl-3 ${isUnread ? "border-state-social" : "border-border"}`}>
                <div className="flex items-start gap-2">
                  {isUnread ? <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-state-social" aria-label="Unread" /> : null}
                  <div>
                    <p className="text-sm font-medium leading-6">{notificationText(item)}</p>
                    {item.activity_context ? <p className="mt-1 text-sm text-muted-foreground">{item.activity_context.summary}</p> : null}
                    {item.body_preview && item.body_preview !== "good_craic" ? <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.body_preview}</p> : null}
                    <time dateTime={item.created_at} className="mt-2 block text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString("en-AU")}</time>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 pl-3 sm:pl-0">
                <Link href={contextHref(item)} className="inline-flex min-h-11 items-center rounded-control border border-border px-3 text-sm font-semibold hover:bg-muted justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]">Open</Link>
                {isUnread ? (
                  <form action={markNotificationRead}>
                    <input type="hidden" name="notification_id" value={item.id} />
                    <SubmitButton label="Mark read" pendingLabel="Saving..." className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-state-social underline underline-offset-4" />
                  </form>
                ) : null}
                <form action={archiveNotification}>
                  <input type="hidden" name="notification_id" value={item.id} />
                  <SubmitButton label="Archive" pendingLabel="Archiving..." className="inline-flex min-h-11 items-center px-2 text-sm text-muted-foreground underline underline-offset-4" />
                </form>
              </div>
            </article>
          </li>
        )
      })}
    </ol>
  )
}
