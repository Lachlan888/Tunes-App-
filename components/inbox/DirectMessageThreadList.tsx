import Link from "next/link"
import SubmitButton from "@/components/SubmitButton"
import {
  archiveDirectMessageThread,
  deleteDirectMessage,
  sendDirectMessage,
  updateDirectMessage,
} from "@/lib/actions/direct-messages"
import type { DirectMessageThread } from "@/lib/loaders/inbox"

type DirectMessageThreadListProps = {
  threads: DirectMessageThread[]
}

function getUserLabel(thread: DirectMessageThread) {
  return (
    thread.otherUser.display_name ||
    thread.otherUser.username ||
    "Unknown user"
  )
}

export default function DirectMessageThreadList({
  threads,
}: DirectMessageThreadListProps) {
  if (threads.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground shadow-sm">
        No direct messages yet. Messages sent from public profile pages will
        appear here.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {threads.map((thread) => {
        const userLabel = getUserLabel(thread)
        const latestMessage = thread.messages[thread.messages.length - 1]

        return (
          <article
            key={thread.otherUser.id}
            className="rounded-3xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex flex-col gap-3 border-b border-border pb-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground">
                  {userLabel}
                </h2>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {latestMessage ? (
                    <span>
                      Latest{" "}
                      {new Date(latestMessage.created_at).toLocaleString(
                        "en-AU"
                      )}
                    </span>
                  ) : null}

                  {thread.otherUser.username ? (
                    <Link
                      href={`/users/${thread.otherUser.username}`}
                      className="normal-case tracking-normal underline underline-offset-4 hover:text-foreground"
                    >
                      View profile
                    </Link>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {thread.unreadCount > 0 ? (
                  <span className="inline-flex w-fit rounded-full border border-primary bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    {thread.unreadCount} unread
                  </span>
                ) : null}

                <form action={archiveDirectMessageThread}>
                  <input
                    type="hidden"
                    name="other_user_id"
                    value={thread.otherUser.id}
                  />
                  <input type="hidden" name="redirect_to" value="/inbox" />

                  <SubmitButton
                    label="Archive"
                    pendingLabel="Archiving..."
                    className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                  />
                </form>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {thread.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.isOutgoing ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-2xl rounded-2xl border p-3 text-sm leading-6 shadow-sm ${
                      message.isOutgoing
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background/70 text-foreground"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.body}</p>

                    <p
                      className={`mt-2 text-xs ${
                        message.isOutgoing
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground"
                      }`}
                    >
                      {message.isOutgoing ? "Sent" : "Received"} ·{" "}
                      {new Date(message.created_at).toLocaleString("en-AU")}
                    </p>

                    {message.isOutgoing ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <details className="rounded-2xl border border-primary-foreground/40 bg-primary-foreground/10 p-3">
                          <summary className="cursor-pointer text-xs font-medium">
                            Edit
                          </summary>

                          <form
                            action={updateDirectMessage}
                            className="mt-3 space-y-2"
                          >
                            <input
                              type="hidden"
                              name="message_id"
                              value={message.id}
                            />
                            <input
                              type="hidden"
                              name="redirect_to"
                              value="/inbox"
                            />

                            <textarea
                              name="body"
                              rows={3}
                              defaultValue={message.body}
                              className="w-full rounded-2xl border border-border bg-background/90 px-3 py-2 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"
                              required
                            />

                            <SubmitButton
                              label="Save edit"
                              pendingLabel="Saving..."
                              className="rounded-full border border-primary-foreground/50 bg-primary-foreground px-3 py-1.5 text-xs font-medium text-primary shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                            />
                          </form>
                        </details>

                        <form action={deleteDirectMessage}>
                          <input
                            type="hidden"
                            name="message_id"
                            value={message.id}
                          />
                          <input
                            type="hidden"
                            name="redirect_to"
                            value="/inbox"
                          />

                          <SubmitButton
                            label="Delete"
                            pendingLabel="Deleting..."
                            className="rounded-full border border-primary-foreground/50 bg-transparent px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition hover:bg-primary-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                          />
                        </form>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            <form action={sendDirectMessage} className="mt-5 space-y-3">
              <input
                type="hidden"
                name="recipient_user_id"
                value={thread.otherUser.id}
              />
              <input type="hidden" name="redirect_to" value="/inbox" />

              <textarea
                name="body"
                rows={3}
                placeholder={`Reply to ${userLabel}`}
                className="w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"
                required
              />

              <SubmitButton
                label="Send reply"
                pendingLabel="Sending..."
                className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              />
            </form>
          </article>
        )
      })}
    </div>
  )
}