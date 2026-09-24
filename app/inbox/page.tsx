import Link from "next/link"
import type { Metadata } from "next"
import DirectMessageThreadList from "@/components/inbox/DirectMessageThreadList"
import InboxItemList from "@/components/inbox/InboxItemList"
import SubmitButton from "@/components/SubmitButton"
import PageHeader from "@/components/ui/PageHeader"
import { markAllNotificationsRead } from "@/lib/actions/activity-interactions"
import { paginateItems, parseInboxPage, parseInboxTab } from "@/lib/inbox-view-state"
import { loadInboxData } from "@/lib/loaders/inbox"

export const metadata: Metadata = {
  title: "Inbox | Tunes",
}

type InboxPageProps = {
  searchParams: Promise<{
    direct_message?: string
    tab?: string
    page?: string
  }>
}

function statusMessage(status?: string) {
  if (status === "sent") return "Message sent."
  if (status === "edited") return "Message edited."
  if (status === "deleted") return "Message deleted."
  if (status === "archived") return "Conversation archived."
  return null
}

export default async function InboxPage({ searchParams }: InboxPageProps) {
  const params = await searchParams
  const tab = parseInboxTab(params.tab)
  const page = parseInboxPage(params.page)
  const data = await loadInboxData()
  const newItems = data.notificationItems.filter((item) => item.read_at === null).slice(0, 20)
  const history = paginateItems(
    data.notificationItems.filter((item) => item.read_at !== null),
    page
  )
  const message = statusMessage(params.direct_message)

  return (
    <main className="mx-auto max-w-[1100px] px-4 py-5 text-foreground sm:px-6 sm:py-8">
      <PageHeader title="Inbox" />

      {message ? (
        <p role="status" className="mb-5 border-l-4 border-primary py-2 pl-3 text-sm font-medium">
          {message}
        </p>
      ) : null}

      <nav aria-label="Inbox categories" className="mb-8 inline-flex rounded-full border border-border bg-muted/50 p-1">
        <Link
          href="/inbox?tab=activity"
          aria-current={tab === "activity" ? "page" : undefined}
          className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold ${tab === "activity" ? "bg-state-social text-state-social-foreground" : "text-muted-foreground"}`}
        >
          Activity {data.unreadNotificationCount > 0 ? `· ${data.unreadNotificationCount}` : ""}
        </Link>
        <Link
          href="/inbox?tab=messages"
          aria-current={tab === "messages" ? "page" : undefined}
          className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold ${tab === "messages" ? "bg-state-social text-state-social-foreground" : "text-muted-foreground"}`}
        >
          Messages {data.unreadMessageCount > 0 ? `· ${data.unreadMessageCount}` : ""}
        </Link>
      </nav>

      {tab === "messages" ? (
        <section aria-labelledby="messages-title">
          <h1 id="messages-title" className="mt-1 font-serif text-3xl font-bold">Conversations</h1>
          <p className="mb-5 mt-2 text-sm text-muted-foreground">Open a person to read the latest messages and reply.</p>
          <DirectMessageThreadList threads={data.messageThreads} />
        </section>
      ) : (
        <div className="space-y-10">
          <section aria-labelledby="new-title">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h1 id="new-title" className="mt-1 font-serif text-3xl font-bold">New</h1>
              </div>
              {data.unreadNotificationCount > 0 ? (
                <form action={markAllNotificationsRead}>
                  <SubmitButton label="Mark all read" pendingLabel="Marking read..." className="inline-flex min-h-11 items-center rounded-control border border-state-social px-4 text-sm font-semibold text-state-social justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]" />
                </form>
              ) : null}
            </div>
            <div className="mt-4">
              <InboxItemList items={newItems} emptyMessage="You’re caught up. New activity will appear here." />
            </div>
          </section>

          <section aria-labelledby="history-title">
            <h2 id="history-title" className="mt-1 font-serif text-2xl font-bold">History</h2>
            <div className="mt-4">
              <InboxItemList items={history.items} emptyMessage="No activity history yet." />
            </div>
            {(history.hasPrevious || history.hasNext) ? (
              <nav aria-label="Activity history pages" className="mt-4 flex items-center justify-between gap-4">
                {history.hasPrevious ? <Link href={`/inbox?tab=activity&page=${history.page - 1}`} className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4">← Newer</Link> : <span />}
                <span className="text-sm text-muted-foreground">Page {history.page}</span>
                {history.hasNext ? <Link href={`/inbox?tab=activity&page=${history.page + 1}`} className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4">Older →</Link> : <span />}
              </nav>
            ) : null}
          </section>
        </div>
      )}
    </main>
  )
}
