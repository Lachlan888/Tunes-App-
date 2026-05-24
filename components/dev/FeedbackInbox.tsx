import Link from "next/link"
import SubmitButton from "@/components/SubmitButton"
import { updateBetaFeedbackAdminFields } from "@/lib/actions/dev-feedback"
import type { BetaFeedbackItem } from "@/lib/types"

type FeedbackInboxProps = {
  feedbackItems: BetaFeedbackItem[]
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value))
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ")
}

function getReporterName(item: BetaFeedbackItem) {
  return item.userDisplayName || item.username || "Unknown user"
}

function getSafeInternalPath(value: string | null | undefined) {
  const pagePath = String(value ?? "").trim()

  if (!pagePath) return null
  if (pagePath === "unknown") return null
  if (!pagePath.startsWith("/")) return null
  if (pagePath.startsWith("//")) return null

  return pagePath
}

const selectClassName =
  "w-full rounded-2xl border border-border bg-background/80 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"

const textareaClassName =
  "min-h-20 w-full rounded-2xl border border-border bg-background/80 px-3 py-2 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"

export default function FeedbackInbox({ feedbackItems }: FeedbackInboxProps) {
  const activeFeedbackItems = feedbackItems.filter((item) => !item.resolved_at)

  if (activeFeedbackItems.length === 0) {
    return (
      <div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
        No unresolved beta feedback.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activeFeedbackItems.map((item) => {
        const safePagePath = getSafeInternalPath(item.page_path)

        return (
          <article
            key={item.id}
            className="rounded-3xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {formatLabel(item.category)}
                  </span>
                  <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {formatLabel(item.status)}
                  </span>
                  <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {formatLabel(item.owner_priority)}
                  </span>
                </div>

                <p className="mt-3 text-sm text-muted-foreground">
                  {getReporterName(item)} · {formatDate(item.created_at)}
                </p>

                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                  {safePagePath ? (
                    <Link
                      href={safePagePath}
                      className="inline-flex w-fit rounded-full border border-primary bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                    >
                      Open page
                    </Link>
                  ) : (
                    <span className="inline-flex w-fit rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                      No page link
                    </span>
                  )}

                  <p className="break-all text-sm font-medium text-foreground">
                    {item.page_path}
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Severity: {formatLabel(item.severity)}
              </p>
            </div>

            <p className="mt-4 whitespace-pre-wrap text-sm leading-6">
              {item.message}
            </p>

            {item.browser || item.viewport_width || item.viewport_height ? (
              <div className="mt-4 rounded-2xl border border-border bg-background/70 p-3 text-xs leading-5 text-muted-foreground">
                {item.viewport_width && item.viewport_height ? (
                  <p>
                    Viewport: {item.viewport_width} × {item.viewport_height}
                  </p>
                ) : null}
                {item.browser ? (
                  <p className="mt-1 break-all">Browser: {item.browser}</p>
                ) : null}
              </div>
            ) : null}

            <form action={updateBetaFeedbackAdminFields} className="mt-4 space-y-3">
              <input type="hidden" name="feedback_id" value={item.id} />
              <input type="hidden" name="redirect_to" value="/dev" />

              <div className="grid gap-3 md:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Status
                  </span>
                  <select
                    name="status"
                    defaultValue={item.status}
                    className={`${selectClassName} mt-2`}
                  >
                    <option value="new">New</option>
                    <option value="triaged">Triaged</option>
                    <option value="planned">Planned</option>
                    <option value="fixed">Fixed</option>
                    <option value="wont_fix">Won&apos;t fix</option>
                    <option value="needs_more_info">Needs more info</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Owner priority
                  </span>
                  <select
                    name="owner_priority"
                    defaultValue={item.owner_priority}
                    className={`${selectClassName} mt-2`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="launch_blocker">Launch blocker</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Owner notes
                </span>
                <textarea
                  name="owner_notes"
                  defaultValue={item.owner_notes ?? ""}
                  className={`${textareaClassName} mt-2`}
                  placeholder="Decision, next action, or implementation note."
                />
              </label>

              <label className="flex items-start gap-3 rounded-2xl border border-border bg-background/70 p-3 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  name="notify_reporter"
                  value="true"
                  className="mt-1"
                />
                <span>
                  Send this note to the submitting user as a normal inbox
                  message when updating. Resolving always sends them a message.
                </span>
              </label>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <SubmitButton
                  name="intent"
                  value="update"
                  label="Update feedback"
                  pendingLabel="Updating…"
                  className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                />

                <SubmitButton
                  name="intent"
                  value="resolve"
                  label="Resolve, notify, and archive"
                  pendingLabel="Resolving…"
                  className="rounded-full border border-primary bg-background/70 px-4 py-2 text-sm font-semibold text-primary shadow-sm transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                />
              </div>
            </form>
          </article>
        )
      })}
    </div>
  )
}