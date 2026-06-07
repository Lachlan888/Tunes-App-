import DirectMessageThreadList from "@/components/inbox/DirectMessageThreadList"
import InboxItemList from "@/components/inbox/InboxItemList"
import SubmitButton from "@/components/SubmitButton"
import {
  archiveAllInboxItems,
  markAllNotificationsRead,
} from "@/lib/actions/activity-interactions"
import { loadInboxData } from "@/lib/loaders/inbox"

type InboxPageProps = {
  searchParams?: Promise<{
    direct_message?: string
  }>
}

function getDirectMessageMessage(status?: string) {
  if (status === "sent") {
    return {
      tone: "success" as const,
      text: "Message sent.",
    }
  }

  if (status === "edited") {
    return {
      tone: "success" as const,
      text: "Message edited.",
    }
  }

  if (status === "deleted") {
    return {
      tone: "success" as const,
      text: "Message deleted.",
    }
  }

  if (status === "archived") {
    return {
      tone: "success" as const,
      text: "Conversation archived.",
    }
  }

  if (status === "missing_user") {
    return {
      tone: "warning" as const,
      text: "Couldn’t tell which person to message.",
    }
  }

  if (status === "missing_body") {
    return {
      tone: "warning" as const,
      text: "Write a message before sending.",
    }
  }

  if (status === "missing_message") {
    return {
      tone: "warning" as const,
      text: "Couldn’t tell which message to update.",
    }
  }

  if (status === "self") {
    return {
      tone: "warning" as const,
      text: "You cannot send a direct message to yourself.",
    }
  }

  if (status === "not_found") {
    return {
      tone: "error" as const,
      text: "That person couldn’t be found.",
    }
  }

  return null
}

function getMessageClasses(
  tone: "success" | "warning" | "error" | "neutral"
) {
  if (tone === "success") {
    return "mb-6 rounded-2xl border border-success bg-muted p-4 text-sm font-medium text-foreground shadow-sm"
  }

  if (tone === "warning") {
    return "mb-6 rounded-2xl border border-warning bg-muted p-4 text-sm font-medium text-foreground shadow-sm"
  }

  if (tone === "error") {
    return "mb-6 rounded-2xl border border-destructive bg-muted p-4 text-sm font-medium text-destructive shadow-sm"
  }

  return "mb-6 rounded-2xl border border-border bg-muted p-4 text-sm font-medium text-muted-foreground shadow-sm"
}

export default async function InboxPage({ searchParams }: InboxPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const directMessageMessage = getDirectMessageMessage(
    resolvedSearchParams?.direct_message
  )

  const {
    notificationItems,
    messageThreads,
    unreadNotificationCount,
    unreadMessageCount,
    unreadCount,
  } = await loadInboxData()

  const hasInboxItems =
    notificationItems.length > 0 || messageThreads.length > 0

  return (
    <main className="mx-auto max-w-[1500px] px-6 py-8 text-foreground">
      {directMessageMessage ? (
        <div className={getMessageClasses(directMessageMessage.tone)}>
          {directMessageMessage.text}
        </div>
      ) : null}

      <section className="mb-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Inbox
            </p>

            <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight">
              Messages and notifications
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              Threaded direct messages, activity replies, tune-comment replies,
              moderation outcomes, and Good craic! reactions from other
              musicians.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            <div className="grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-background/70 px-4 py-3">
                <p className="font-semibold text-foreground">{unreadCount}</p>
                <p className="text-muted-foreground">Unread total</p>
              </div>

              <div className="rounded-2xl border border-border bg-background/70 px-4 py-3">
                <p className="font-semibold text-foreground">
                  {unreadMessageCount}
                </p>
                <p className="text-muted-foreground">Messages</p>
              </div>

              <div className="rounded-2xl border border-border bg-background/70 px-4 py-3">
                <p className="font-semibold text-foreground">
                  {unreadNotificationCount}
                </p>
                <p className="text-muted-foreground">Notifications</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 md:justify-end">
              {unreadCount > 0 ? (
                <form action={markAllNotificationsRead}>
                  <SubmitButton
                    label="Mark all read"
                    pendingLabel="Marking read..."
                    className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                  />
                </form>
              ) : (
                <p className="rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground">
                  All caught up
                </p>
              )}

              {hasInboxItems ? (
                <form action={archiveAllInboxItems}>
                  <SubmitButton
                    label="Archive all"
                    pendingLabel="Archiving..."
                    className="rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                  />
                </form>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <div className="mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Messages
          </h2>
        </div>

        <DirectMessageThreadList threads={messageThreads} />
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Notifications
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Good craic! reactions, replies, and moderation outcomes appear
            here.
          </p>
        </div>

        <InboxItemList items={notificationItems} />
      </section>
    </main>
  )
}
