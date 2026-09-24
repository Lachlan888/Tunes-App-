import Link from "next/link"
import SubmitButton from "@/components/SubmitButton"
import { archiveDirectMessageThread, sendDirectMessage } from "@/lib/actions/direct-messages"
import type { DirectMessageThread } from "@/lib/loaders/inbox"

function userLabel(thread: DirectMessageThread) {
  return thread.otherUser.display_name || thread.otherUser.username || "Unknown player"
}

export default function DirectMessageThreadList({
  threads,
}: {
  threads: DirectMessageThread[]
}) {
  if (threads.length === 0) {
    return (
      <p className="border-y border-dashed border-border py-5 text-sm text-muted-foreground">
        No direct messages yet.
      </p>
    )
  }

  return (
    <div className="divide-y divide-border border-y border-border">
      {threads.map((thread) => {
        const label = userLabel(thread)
        const latest = thread.messages.at(-1)

        return (
          <details key={thread.otherUser.id} className="group py-3">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {thread.unreadCount > 0 ? (
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-state-social" aria-label="Unread messages" />
                  ) : null}
                  <h2 className="truncate font-semibold">{label}</h2>
                </div>
                <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                  {latest?.isOutgoing ? "You: " : ""}{latest?.body ?? "Open conversation"}
                </p>
              </div>
              <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                {thread.unreadCount > 0 ? `${thread.unreadCount} new` : "Open"}
              </span>
            </summary>

            <div className="ml-4 mt-3 border-l-2 border-state-social pl-4">
              {thread.totalMessageCount > thread.messages.length ? (
                <p className="mb-3 text-xs text-muted-foreground">
                  Showing the latest {thread.messages.length} of {thread.totalMessageCount} messages.
                </p>
              ) : null}
              <ol className="space-y-3">
                {thread.messages.map((message) => (
                  <li key={message.id} className="text-sm">
                    <p className="whitespace-pre-wrap leading-6">{message.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {message.isOutgoing ? "You" : label} · {new Date(message.created_at).toLocaleString("en-AU")}
                    </p>
                  </li>
                ))}
              </ol>

              <form action={sendDirectMessage} className="mt-4 space-y-3">
                <input type="hidden" name="recipient_user_id" value={thread.otherUser.id} />
                <input type="hidden" name="redirect_to" value="/inbox?tab=messages" />
                <label className="block text-sm font-semibold" htmlFor={`reply-${thread.otherUser.id}`}>Reply to {label}</label>
                <textarea id={`reply-${thread.otherUser.id}`} name="body" rows={3} required className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]" />
                <div className="flex flex-wrap gap-2">
                  <SubmitButton label="Send reply" pendingLabel="Sending..." className="inline-flex min-h-11 rounded-control bg-primary px-4 text-sm font-semibold text-primary-foreground items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]" />
                  {thread.otherUser.username ? (
                    <Link href={`/users/${thread.otherUser.username}`} className="inline-flex min-h-11 items-center px-2 text-sm font-semibold underline underline-offset-4">View profile</Link>
                  ) : null}
                </div>
              </form>

              <form action={archiveDirectMessageThread} className="mt-3">
                <input type="hidden" name="other_user_id" value={thread.otherUser.id} />
                <input type="hidden" name="redirect_to" value="/inbox?tab=messages" />
                <SubmitButton label="Archive conversation" pendingLabel="Archiving..." className="inline-flex min-h-11 items-center text-sm text-muted-foreground underline underline-offset-4" />
              </form>
            </div>
          </details>
        )
      })}
    </div>
  )
}
