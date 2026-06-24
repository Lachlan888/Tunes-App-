"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import type { KeyboardEvent, MouseEvent, ReactNode } from "react"
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

function stopCardNavigation(event: MouseEvent | KeyboardEvent) {
  event.stopPropagation()
}

function actorLink(item: InboxItem) {
  const label = actorName(item)

  if (!item.actor?.username) {
    return <span>{label}</span>
  }

  return (
    <Link
      href={`/users/${item.actor.username}`}
      onClick={stopCardNavigation}
      onKeyDown={stopCardNavigation}
      className="relative z-20 font-medium underline underline-offset-4 hover:text-primary"
    >
      {label}
    </Link>
  )
}

function setlistName(item: InboxItem) {
  return item.setlist?.name ?? "a setlist"
}

function badgeName(item: InboxItem) {
  return item.badge?.name ?? "a badge"
}

function notificationTitle(item: InboxItem) {
  if (item.notification_type === "badge_awarded") {
    return (
      <>
        {actorLink(item)} awarded you the badge {badgeName(item)}.
      </>
    )
  }

  if (item.notification_type === "activity_reaction") {
    return <>{actorLink(item)} gave your activity Good craic!</>
  }

  if (item.notification_type === "activity_reply") {
    return <>{actorLink(item)} replied to your activity.</>
  }

  if (item.notification_type === "comment_reply") {
    return <>{actorLink(item)} replied to your tune comment.</>
  }

  if (item.notification_type === "composer_attribution_added") {
    return (
      <>
        You were tagged as composer
        {item.piece ? <> of {item.piece.title}</> : null}.
      </>
    )
  }

  if (item.notification_type === "composer_tune_started_practice") {
    return (
      <>
        {actorLink(item)} started practising
        {item.piece ? <> your tune {item.piece.title}</> : <> one of your tunes</>}.
      </>
    )
  }

  if (item.notification_type === "learning_list_shared") {
    return (
      <>
        {actorLink(item)} shared
        {item.learning_list ? <> "{item.learning_list.name}"</> : <> a list</>}{" "}
        with you.
      </>
    )
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
  if (item.notification_type === "activity_reaction" && item.activity_context?.href) {
    return item.activity_context.href
  }

  if (item.badge) {
    return `/badges/${item.badge.slug}`
  }

  if (item.setlist) {
    return `/setlists/${item.setlist.id}`
  }

  if (item.piece) {
    return `/library/${item.piece.id}`
  }

  if (item.learning_list) {
    if (item.notification_type === "learning_list_shared") {
      return `/learning-lists/${item.learning_list.id}`
    }

    return `/public-lists/${item.learning_list.id}`
  }

  if (item.actor?.username) {
    return `/users/${item.actor.username}`
  }

  return "/inbox"
}

function contextLabel(item: InboxItem) {
  if (item.badge) {
    return `Open ${item.badge.name}`
  }

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

function InboxCard({
  item,
  children,
}: {
  item: InboxItem
  children: ReactNode
}) {
  const router = useRouter()
  const href = contextHref(item)

  function openContext() {
    router.push(href)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      openContext()
    }
  }

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={contextLabel(item)}
      onClick={openContext}
      onKeyDown={handleKeyDown}
      className={`group cursor-pointer rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] ${
        item.read_at === null
          ? "border-primary bg-card"
          : "border-border bg-background/70"
      }`}
    >
      {children}
    </article>
  )
}

export default function InboxItemList({ items }: InboxItemListProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground shadow-sm">
        No notifications yet. Reactions, replies, moderation outcomes, setlist
        changes, and badge awards will appear here.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isUnread = item.read_at === null
        const body = item.body_preview || null

        return (
          <InboxCard key={item.id} item={item}>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm leading-6 text-foreground transition group-hover:text-primary">
                  {notificationTitle(item)}
                </p>

                {body && body !== "good_craic" ? (
                  <p className="mt-3 whitespace-pre-wrap rounded-2xl border border-border bg-muted/70 p-3 text-sm leading-6 text-foreground">
                    {body}
                  </p>
                ) : null}

                {item.notification_type === "activity_reaction" ? (
                  item.activity_context ? (
                    item.activity_context.href ? (
                      <Link
                        href={item.activity_context.href}
                        onClick={stopCardNavigation}
                        onKeyDown={stopCardNavigation}
                        className="relative z-20 mt-2 block text-sm leading-6 text-muted-foreground underline underline-offset-4 hover:text-primary"
                      >
                        {item.activity_context.summary}
                      </Link>
                    ) : (
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {item.activity_context.summary}
                      </p>
                    )
                  ) : (
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Activity details unavailable
                    </p>
                  )
                ) : null}

                <p className="mt-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {new Date(item.created_at).toLocaleString("en-AU")}
                  {isUnread ? " · Unread" : " · Read"}
                </p>
              </div>

              <div
                className="relative z-20 flex flex-wrap gap-2"
                onClick={stopCardNavigation}
                onKeyDown={stopCardNavigation}
              >
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
          </InboxCard>
        )
      })}
    </div>
  )
}
