import Link from "next/link"
import PageOptionsModal from "@/components/page-options/PageOptionsModal"
import SubmitButton from "@/components/SubmitButton"
import {
  actionLoreReport,
  approvePieceEditRequest,
  dismissCommentReport,
  dismissLoreReport,
  hideReportedComment,
  rejectPieceEditRequest,
} from "@/lib/actions/moderation"
import { loadModerationData } from "@/lib/loaders/moderation"
import { loadPagePreferences } from "@/lib/loaders/page-preferences"
import { MODERATOR_PAGE_OPTIONS_CONFIG } from "@/lib/page-options/configs"

type ModeratorPageProps = {
  searchParams?: Promise<{
    moderation?: string | string[]
    page_options?: string | string[]
  }>
}

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? ""
}

function getStatusMessage(status: string) {
  if (status === "approved") return "Tune edit request approved."
  if (status === "rejected") return "Tune edit request rejected."
  if (status === "comment_hidden") return "Comment hidden."
  if (status === "report_dismissed") return "Comment report dismissed."
  if (status === "lore_actioned") return "Lore report marked actioned."
  if (status === "lore_dismissed") return "Lore report dismissed."
  if (status === "missing_request") return "Couldn’t tell which request to update."
  if (status === "request_not_found") return "That request could not be found."
  if (status === "piece_not_found") return "That tune could not be found."
  if (status === "missing_comment") return "Couldn’t tell which comment to update."
  if (status === "comment_not_found") return "That comment could not be found."
  if (status === "missing_report") return "Couldn’t tell which report to update."
  if (status === "missing_lore_report") return "Couldn’t tell which lore report to update."
  if (status === "invalid_key") return "One of the proposed keys was invalid."
  if (status === "invalid_url") return "One of the proposed URLs was invalid."
  if (status === "error") return "Something went wrong. Please try again."

  if (status === "saved") return "Moderator display options saved."
  if (status === "reset") return "Moderator display options reset."

  return null
}

function getPageOptionsMessage(status: string) {
  if (status === "saved") return "Moderator display options saved."
  if (status === "reset") return "Moderator display options reset."
  if (status === "error") return "Couldn’t save display options."

  return null
}

function formatProposedChanges(changes: Record<string, unknown>) {
  return Object.entries(changes).filter(([, value]) => {
    return typeof value === "string" && value.trim().length > 0
  })
}

function formatCategory(category: string) {
  return category.replaceAll("_", " ")
}

const textareaClassName =
  "w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"

export default async function ModeratorPage({
  searchParams,
}: ModeratorPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const pagePreferences = await loadPagePreferences(
    MODERATOR_PAGE_OPTIONS_CONFIG.pageKey
  )

  const showSection = (sectionId: string) =>
    pagePreferences.visibleSections[sectionId] ?? true

  const moderationMessage = getStatusMessage(
    getSingleValue(resolvedSearchParams?.moderation)
  )
  const pageOptionsMessage = getPageOptionsMessage(
    getSingleValue(resolvedSearchParams?.page_options)
  )
  const statusMessage = pageOptionsMessage ?? moderationMessage

  const {
    pendingEditRequests,
    pendingCommentReports,
    pendingLoreReports,
  } = await loadModerationData()

  return (
    <main className="mx-auto max-w-[1500px] px-6 py-8 text-foreground">
      {statusMessage ? (
        <div className="mb-6 rounded-2xl border border-border bg-card p-4 text-sm font-medium text-foreground shadow-sm">
          {statusMessage}
        </div>
      ) : null}

      <section className="mb-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Moderator
            </p>
            <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight md:text-5xl">
              Tune edits, comment reports, and lore reports
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              Review proposed corrections to shared tune details, handle
              reported comments, and judge reported lore entries.
            </p>
          </div>

          <PageOptionsModal
            config={MODERATOR_PAGE_OPTIONS_CONFIG}
            preferences={pagePreferences}
            redirectTo="/moderator"
          />
        </div>

        {showSection("summary_counts") ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-background/70 p-4">
              <p className="font-serif text-4xl font-bold">
                {pendingEditRequests.length}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Pending tune edit requests
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-background/70 p-4">
              <p className="font-serif text-4xl font-bold">
                {pendingCommentReports.length}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Pending comment reports
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-background/70 p-4">
              <p className="font-serif text-4xl font-bold">
                {pendingLoreReports.length}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Pending lore reports
              </p>
            </div>
          </div>
        ) : null}
      </section>

      {showSection("tune_edit_requests") ? (
        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Tune edit requests
          </h2>

          {pendingEditRequests.length > 0 ? (
            <ul className="mt-5 space-y-5">
              {pendingEditRequests.map((request) => {
                const proposedChanges = formatProposedChanges(
                  request.proposed_changes
                )

                return (
                  <li
                    key={request.id}
                    className="rounded-3xl border border-border bg-card p-6 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <Link
                          href={`/library/${request.piece_id}`}
                          className="font-serif text-2xl font-bold underline-offset-4 hover:underline"
                        >
                          {request.pieceTitle}
                        </Link>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Requested by {request.requesterName}
                        </p>
                      </div>

                      <p className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Pending
                      </p>
                    </div>

                    {request.reason ? (
                      <div className="mt-5 rounded-2xl border border-border bg-background/70 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Reason
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                          {request.reason}
                        </p>
                      </div>
                    ) : null}

                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                      {proposedChanges.map(([key, value]) => (
                        <div
                          key={key}
                          className="rounded-2xl border border-border bg-background/70 p-4"
                        >
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            {key.replaceAll("_", " ")}
                          </p>
                          <p className="mt-2 whitespace-pre-wrap break-words text-sm font-medium">
                            {String(value)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 grid gap-4 lg:grid-cols-2">
                      <form action={approvePieceEditRequest} className="space-y-3">
                        <input
                          type="hidden"
                          name="request_id"
                          value={request.id}
                        />
                        <input
                          type="hidden"
                          name="redirect_to"
                          value="/moderator"
                        />
                        <textarea
                          name="moderator_comment"
                          rows={3}
                          placeholder="Optional moderator comment"
                          className={textareaClassName}
                        />
                        <SubmitButton
                          label="Approve request"
                          pendingLabel="Approving..."
                          className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                        />
                      </form>

                      <form action={rejectPieceEditRequest} className="space-y-3">
                        <input
                          type="hidden"
                          name="request_id"
                          value={request.id}
                        />
                        <input
                          type="hidden"
                          name="redirect_to"
                          value="/moderator"
                        />
                        <textarea
                          name="moderator_comment"
                          rows={3}
                          placeholder="Reason for rejection"
                          className={textareaClassName}
                        />
                        <SubmitButton
                          label="Reject request"
                          pendingLabel="Rejecting..."
                          className="rounded-full border border-destructive bg-background/70 px-4 py-2 text-sm font-medium text-destructive shadow-sm transition hover:bg-destructive hover:text-destructive-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                        />
                      </form>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="mt-5 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
              No pending tune edit requests.
            </p>
          )}
        </section>
      ) : null}

      {showSection("comment_reports") ? (
        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Comment reports
          </h2>

          {pendingCommentReports.length > 0 ? (
            <ul className="mt-5 space-y-5">
              {pendingCommentReports.map((report) => (
                <li
                  key={report.id}
                  className="rounded-3xl border border-border bg-card p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <Link
                        href={`/library/${report.pieceId}`}
                        className="font-serif text-2xl font-bold underline-offset-4 hover:underline"
                      >
                        {report.pieceTitle}
                      </Link>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Reported by {report.reporterName}. Comment by{" "}
                        {report.commentAuthorName}.
                      </p>
                    </div>

                    <p className="rounded-full border border-warning bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {report.reason.replaceAll("_", " ")}
                    </p>
                  </div>

                  <div className="mt-5 rounded-2xl border border-border bg-background/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Reported comment
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                      {report.commentBody}
                    </p>
                  </div>

                  {report.details ? (
                    <div className="mt-3 rounded-2xl border border-border bg-background/70 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Report details
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                        {report.details}
                      </p>
                    </div>
                  ) : null}

                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    <form action={hideReportedComment} className="space-y-3">
                      <input type="hidden" name="report_id" value={report.id} />
                      <input
                        type="hidden"
                        name="comment_id"
                        value={report.comment_id}
                      />
                      <input type="hidden" name="redirect_to" value="/moderator" />
                      <textarea
                        name="moderator_note"
                        rows={3}
                        placeholder="Optional moderation note"
                        className={textareaClassName}
                      />
                      <SubmitButton
                        label="Hide comment"
                        pendingLabel="Hiding..."
                        className="rounded-full border border-destructive bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground shadow-sm transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                      />
                    </form>

                    <form action={dismissCommentReport} className="space-y-3">
                      <input type="hidden" name="report_id" value={report.id} />
                      <input type="hidden" name="redirect_to" value="/moderator" />
                      <textarea
                        name="moderator_note"
                        rows={3}
                        placeholder="Why are you dismissing this report?"
                        className={textareaClassName}
                      />
                      <SubmitButton
                        label="Dismiss report"
                        pendingLabel="Dismissing..."
                        className="rounded-full border border-primary bg-background/70 px-4 py-2 text-sm font-medium text-primary shadow-sm transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                      />
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
              No pending comment reports.
            </p>
          )}
        </section>
      ) : null}

      {showSection("lore_reports") ? (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Lore reports
          </h2>

          {pendingLoreReports.length > 0 ? (
            <ul className="mt-5 space-y-5">
              {pendingLoreReports.map((report) => (
                <li
                  key={report.id}
                  className="rounded-3xl border border-border bg-card p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <Link
                        href={`/library/${report.pieceId}`}
                        className="font-serif text-2xl font-bold underline-offset-4 hover:underline"
                      >
                        {report.pieceTitle}
                      </Link>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Reported by {report.reporterName}. Lore added by{" "}
                        {report.loreAuthorName}.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <p className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        {formatCategory(report.loreCategory)}
                      </p>
                      <p className="rounded-full border border-warning bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        {report.reason.replaceAll("_", " ")}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-border bg-background/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Reported lore entry
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                      {report.loreEntryText}
                    </p>
                  </div>

                  {report.details ? (
                    <div className="mt-3 rounded-2xl border border-border bg-background/70 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Report details
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                        {report.details}
                      </p>
                    </div>
                  ) : null}

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                      href={`/library/${report.pieceId}`}
                      className="rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                    >
                      Open tune to edit lore
                    </Link>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    <form action={actionLoreReport} className="space-y-3">
                      <input type="hidden" name="report_id" value={report.id} />
                      <input type="hidden" name="piece_id" value={report.pieceId} />
                      <input type="hidden" name="redirect_to" value="/moderator" />
                      <textarea
                        name="moderator_note"
                        rows={3}
                        placeholder="What action did you take?"
                        className={textareaClassName}
                      />
                      <SubmitButton
                        label="Mark actioned"
                        pendingLabel="Saving..."
                        className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                      />
                    </form>

                    <form action={dismissLoreReport} className="space-y-3">
                      <input type="hidden" name="report_id" value={report.id} />
                      <input type="hidden" name="redirect_to" value="/moderator" />
                      <textarea
                        name="moderator_note"
                        rows={3}
                        placeholder="Why are you dismissing this report?"
                        className={textareaClassName}
                      />
                      <SubmitButton
                        label="Dismiss report"
                        pendingLabel="Dismissing..."
                        className="rounded-full border border-primary bg-background/70 px-4 py-2 text-sm font-medium text-primary shadow-sm transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                      />
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
              No pending lore reports.
            </p>
          )}
        </section>
      ) : null}
    </main>
  )
}
