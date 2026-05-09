import Link from "next/link"
import SubmitButton from "@/components/SubmitButton"
import {
  archiveNotification,
  markNotificationRead,
} from "@/lib/actions/activity-interactions"
import type { InboxItem } from "@/lib/loaders/inbox"

type InboxItemListProps = {
  items: InboxItem[]
}

function actorName(item: InboxItem) {
  return item.actor?.display_name || item.actor?.username || "Someone"
}

function actorLink(item: InboxItem) {
  const label = actorName(item)

  if (!item.actor?.username) {
    return <span>{label}</span>
  }

  return (
    <Link
      href={`/users/${item.actor.username}`}
      className="font-medium underline underline-offset-4 hover:text-primary"
    >
      {label}
    </Link>
  )
}

function setlistName(item: InboxItem) {
  return item.setlist?.name ?? "a setlist"
}

function notificationTitle(item: InboxItem) {
  if (item.notification_type === "activity_reaction") {
    return <>{actorLink(item)} gave your activity Good craic!</>
  }

  if (item.notification_type === "activity_reply") {
    return <>{actorLink(item)} replied to your activity.</>
  }

  if (item.notification_type === "comment_reply") {
    return <>{actorLink(item)} replied to your tune comment.</>
  }

  if (item.notification_type === "piece_edit_request_approved") {
    return (
      <>
        Your edit request
        {item.piece ? <> for {item.piece.title}</> : null} was approved.
      </>
    )
  }

  if (item.notification_type === "piece_edit_request_rejected") {
    return (
      <>
        Your edit request
        {item.piece ? <> for {item.piece.title}</> : null} was rejected.
      </>
    )
  }

  if (item.notification_type === "setlist_invite") {
    return <>{actorLink(item)} invited you to {setlistName(item)}.</>
  }

  if (item.notification_type === "setlist_invite_accepted") {
    return <>{actorLink(item)} joined {setlistName(item)}.</>
  }

  if (item.notification_type === "setlist_tune_added") {
    return (
      <>
        {actorLink(item)} added
        {item.piece ? <> {item.piece.title}</> : <> a tune</>} to{" "}
        {setlistName(item)}.
      </>
    )
  }

  if (item.notification_type === "setlist_tune_removed") {
    return (
      <>
        {actorLink(item)} removed
        {item.piece ? <> {item.piece.title}</> : <> a tune</>} from{" "}
        {setlistName(item)}.
      </>
    )
  }

  if (item.notification_type === "setlist_item_updated") {
    return (
      <>
        {actorLink(item)} updated
        {item.piece ? <> {item.piece.title}</> : <> a tune</>} in{" "}
        {setlistName(item)}.
      </>
    )
  }

  if (item.notification_type === "setlist_details_updated") {
    return <>{actorLink(item)} updated {setlistName(item)}.</>
  }

  return <>{actorLink(item)} sent you a notification.</>
}

function contextHref(item: InboxItem) {
  if (item.setlist) {
    return `/setlists/${item.setlist.id}`
  }

  if (item.piece) {
    return `/library/${item.piece.id}`
  }

  if (item.learning_list) {
    return `/public-lists/${item.learning_list.id}`
  }

  if (item.actor?.username) {
    return `/users/${item.actor.username}`
  }

  return "/inbox"
}

function contextLabel(item: InboxItem) {
  if (item.setlist) {
    return `Open ${item.setlist.name}`
  }

  if (item.piece) {
    return `Open ${item.piece.title}`
  }

  if (item.learning_list) {
    return `Open ${item.learning_list.name}`
  }

  if (item.actor?.username) {
    return "Open profile"
  }

  return "Open"
}

export default function InboxItemList({ items }: InboxItemListProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground shadow-sm">
        No notifications yet. Reactions, replies, moderation outcomes, and
        setlist changes will appear here.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isUnread = item.read_at === null
        const body = item.body_preview || null

        return (
          <article
            key={item.id}
            className={`rounded-2xl border p-5 shadow-sm ${
              isUnread
                ? "border-primary bg-card"
                : "border-border bg-background/70"
            }`}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm leading-6 text-foreground">
                  {notificationTitle(item)}
                </p>

                {body && body !== "good_craic" ? (
                  <p className="mt-3 whitespace-pre-wrap rounded-2xl border border-border bg-muted/70 p-3 text-sm leading-6 text-foreground">
                    {body}
                  </p>
                ) : null}

                <p className="mt-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {new Date(item.created_at).toLocaleString("en-AU")}
                  {isUnread ? " · Unread" : " · Read"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={contextHref(item)}
                  className="rounded-full border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                >
                  {contextLabel(item)}
                </Link>

                {isUnread ? (
                  <form action={markNotificationRead}>
                    <input
                      type="hidden"
                      name="notification_id"
                      value={item.id}
                    />
                    <SubmitButton
                      label="Mark read"
                      pendingLabel="Saving..."
                      className="rounded-full border border-primary bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                    />
                  </form>
                ) : null}

                <form action={archiveNotification}>
                  <input
                    type="hidden"
                    name="notification_id"
                    value={item.id}
                  />
                  <SubmitButton
                    label="Archive"
                    pendingLabel="Archiving..."
                    className="rounded-full border border-border bg-background/70 px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                  />
                </form>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}