import Link from "next/link"
import { redirect } from "next/navigation"
import BacklogSummarySection from "@/components/BacklogSummarySection"
import ReferenceMediaLink from "@/components/ReferenceMediaLink"
import RemoveFromPracticeButton from "@/components/RemoveFromPracticeButton"
import StreakSummarySection from "@/components/StreakSummarySection"
import SubmitButton from "@/components/SubmitButton"
import { markFailed, markShaky, markSolid } from "@/lib/actions/reviews"
import { loadReviewPageData } from "@/lib/loaders/review"
import { APP_TIME_ZONE } from "@/lib/review"

type ReviewPageProps = {
  searchParams?: Promise<{
    remove_from_practice?: string
    mode?: string
  }>
}

function formatDueDate(dateValue: string | null) {
  if (!dateValue) return "No due date"

  return new Date(dateValue).toLocaleDateString("en-AU", {
    timeZone: APP_TIME_ZONE,
  })
}

function getStatusBadgeClasses(label: string | null) {
  switch (label) {
    case "Due now":
      return "bg-amber-100 text-amber-800"
    case "Overdue":
      return "bg-orange-100 text-orange-800"
    case "Overdue (longest)":
      return "bg-rose-100 text-rose-800"
    default:
      return "bg-blue-100 text-blue-700"
  }
}

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  const resolvedSearchParams = await searchParams
  const removeFromPracticeStatus =
    resolvedSearchParams?.remove_from_practice ?? ""
  const mode = resolvedSearchParams?.mode ?? ""
  const isCatchUpMode = mode === "catch-up"

  const {
    streakSummary,
    practiceItems,
    dueTodayPieces,
    catchUpQueue,
    backlogSummary,
    needsAttentionCount,
  } = await loadReviewPageData()

  const redirectTo = isCatchUpMode ? "/review?mode=catch-up" : "/review"

  const queue = isCatchUpMode ? catchUpQueue : dueTodayPieces

  if (!streakSummary) {
    redirect("/login")
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Practice</h1>

      <div className="mt-8">
        <StreakSummarySection streakSummary={streakSummary} />
      </div>

      {removeFromPracticeStatus === "success" && (
        <div className="mb-6 mt-4 rounded border border-green-600 bg-green-50 p-3 text-sm text-green-800">
          Tune removed from practice.
        </div>
      )}

      {removeFromPracticeStatus === "missing_user_piece" && (
        <div className="mb-6 mt-4 rounded border border-yellow-600 bg-yellow-50 p-3 text-sm text-yellow-800">
          Could not tell which practice item to remove.
        </div>
      )}

      {removeFromPracticeStatus === "not_found" && (
        <div className="mb-6 mt-4 rounded border border-yellow-600 bg-yellow-50 p-3 text-sm text-yellow-800">
          That practice item no longer exists.
        </div>
      )}

      {removeFromPracticeStatus === "error" && (
        <div className="mb-6 mt-4 rounded border border-red-600 bg-red-50 p-3 text-sm text-red-800">
          Could not remove tune from practice.
        </div>
      )}

      <div className="mt-8">
        <BacklogSummarySection
          groups={backlogSummary}
          actionHref={isCatchUpMode ? "/review" : "/review?mode=catch-up"}
          actionLabel={isCatchUpMode ? "Back to Practice" : "Catch up"}
          emptyMessage="Nothing overdue right now."
        />
      </div>

      {isCatchUpMode ? (
        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold">Catch up</h2>
            <p className="mt-2 text-sm text-gray-600">
              Work through overdue tunes in order, starting with the ones that
              have waited longest.
            </p>
          </div>

          {queue.length === 0 ? (
            <p className="text-gray-600">Nothing overdue right now.</p>
          ) : (
            <>
              <p className="mt-4 text-sm text-gray-600">
                {queue.length} overdue tune{queue.length === 1 ? "" : "s"} in
                catch-up
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                {queue.map((userPiece) => (
                  <div key={userPiece.id} className="rounded-lg border p-6">
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="text-2xl font-semibold">
                        {userPiece.piece ? (
                          <Link
                            href={`/library/${userPiece.piece.id}`}
                            className="hover:underline"
                          >
                            {userPiece.piece.title}
                          </Link>
                        ) : (
                          "Untitled piece"
                        )}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClasses(
                          userPiece.backlog_label
                        )}`}
                      >
                        {userPiece.backlog_label}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-gray-600">
                      Key: {userPiece.piece?.key ?? "Unknown"} | Style:{" "}
                      {userPiece.piece?.style ?? "Unknown"} | Time:{" "}
                      {userPiece.piece?.time_signature ?? "Unknown"}
                    </p>

                    {userPiece.piece?.reference_url && userPiece.piece?.title && (
                      <ReferenceMediaLink
                        referenceUrl={userPiece.piece.reference_url}
                        title={userPiece.piece.title}
                      />
                    )}

                    <p className="mt-2 text-sm text-gray-600">
                      Due: {formatDueDate(userPiece.next_review_due)} | Stage:{" "}
                      {userPiece.stage}
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <form action={markFailed}>
                        <input
                          type="hidden"
                          name="userPieceId"
                          value={userPiece.id}
                        />
                        <input
                          type="hidden"
                          name="redirectTo"
                          value={redirectTo}
                        />
                        <SubmitButton
                          label="Rough"
                          pendingLabel="Saving..."
                          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                        />
                      </form>

                      <form action={markShaky}>
                        <input
                          type="hidden"
                          name="userPieceId"
                          value={userPiece.id}
                        />
                        <input
                          type="hidden"
                          name="redirectTo"
                          value={redirectTo}
                        />
                        <SubmitButton
                          label="Shaky"
                          pendingLabel="Saving..."
                          className="rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600"
                        />
                      </form>

                      <form action={markSolid}>
                        <input
                          type="hidden"
                          name="userPieceId"
                          value={userPiece.id}
                        />
                        <input
                          type="hidden"
                          name="redirectTo"
                          value={redirectTo}
                        />
                        <SubmitButton
                          label="Solid"
                          pendingLabel="Saving..."
                          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                        />
                      </form>

                      <RemoveFromPracticeButton
                        userPieceId={userPiece.id}
                        redirectTo={redirectTo}
                        className="rounded-md border px-4 py-2 text-sm font-medium"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      ) : (
        <section className="mt-8">
          {queue.length === 0 ? (
            <p className="text-gray-600">No tunes due today.</p>
          ) : (
            <>
              <p className="mt-4 text-sm text-gray-600">
                {queue.length} tune{queue.length === 1 ? "" : "s"} due today
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                {queue.map((userPiece) => (
                  <div key={userPiece.id} className="rounded-lg border p-6">
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="text-2xl font-semibold">
                        {userPiece.piece ? (
                          <Link
                            href={`/library/${userPiece.piece.id}`}
                            className="hover:underline"
                          >
                            {userPiece.piece.title}
                          </Link>
                        ) : (
                          "Untitled piece"
                        )}
                      </h2>

                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                        Due today
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-gray-600">
                      Key: {userPiece.piece?.key ?? "Unknown"} | Style:{" "}
                      {userPiece.piece?.style ?? "Unknown"} | Time:{" "}
                      {userPiece.piece?.time_signature ?? "Unknown"}
                    </p>

                    {userPiece.piece?.reference_url && userPiece.piece?.title && (
                      <ReferenceMediaLink
                        referenceUrl={userPiece.piece.reference_url}
                        title={userPiece.piece.title}
                      />
                    )}

                    <p className="mt-2 text-sm text-gray-600">
                      Due: {formatDueDate(userPiece.next_review_due)} | Stage:{" "}
                      {userPiece.stage}
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <form action={markFailed}>
                        <input
                          type="hidden"
                          name="userPieceId"
                          value={userPiece.id}
                        />
                        <input
                          type="hidden"
                          name="redirectTo"
                          value={redirectTo}
                        />
                        <SubmitButton
                          label="Rough"
                          pendingLabel="Saving..."
                          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                        />
                      </form>

                      <form action={markShaky}>
                        <input
                          type="hidden"
                          name="userPieceId"
                          value={userPiece.id}
                        />
                        <input
                          type="hidden"
                          name="redirectTo"
                          value={redirectTo}
                        />
                        <SubmitButton
                          label="Shaky"
                          pendingLabel="Saving..."
                          className="rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600"
                        />
                      </form>

                      <form action={markSolid}>
                        <input
                          type="hidden"
                          name="userPieceId"
                          value={userPiece.id}
                        />
                        <input
                          type="hidden"
                          name="redirectTo"
                          value={redirectTo}
                        />
                        <SubmitButton
                          label="Solid"
                          pendingLabel="Saving..."
                          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                        />
                      </form>

                      <RemoveFromPracticeButton
                        userPieceId={userPiece.id}
                        redirectTo={redirectTo}
                        className="rounded-md border px-4 py-2 text-sm font-medium"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      <section className="mt-10 rounded-lg border p-4">
        <details>
          <summary className="cursor-pointer text-lg font-semibold">
            Active practice tunes ({practiceItems.length})
          </summary>

          <p className="mt-2 text-sm text-gray-600">
            Full list of tunes currently in your practice system.
          </p>

          {practiceItems.length === 0 ? (
            <p className="mt-4 text-sm text-gray-600">
              No tunes in practice yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {practiceItems.map((userPiece) => {
                const badgeLabel =
                  userPiece.backlog_label ??
                  (userPiece.due_date_only ? "Scheduled" : "No due date")

                return (
                  <li key={userPiece.id} className="rounded border p-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium">
                          {userPiece.piece ? (
                            <Link
                              href={`/library/${userPiece.piece.id}`}
                              className="hover:underline"
                            >
                              {userPiece.piece.title}
                            </Link>
                          ) : (
                            "Untitled piece"
                          )}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          Key: {userPiece.piece?.key ?? "Unknown"} | Style:{" "}
                          {userPiece.piece?.style ?? "Unknown"} | Time:{" "}
                          {userPiece.piece?.time_signature ?? "Unknown"}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          Due: {formatDueDate(userPiece.next_review_due)} | Stage:{" "}
                          {userPiece.stage}
                        </p>

                        <div className="mt-3">
                          <RemoveFromPracticeButton
                            userPieceId={userPiece.id}
                            redirectTo={redirectTo}
                            className="rounded-md border px-3 py-2 text-sm font-medium"
                          />
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          userPiece.backlog_label
                            ? getStatusBadgeClasses(userPiece.backlog_label)
                            : badgeLabel === "Scheduled"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {badgeLabel}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </details>
      </section>
    </main>
  )
}