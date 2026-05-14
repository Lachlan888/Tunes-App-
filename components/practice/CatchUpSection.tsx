"use client"

import { useMemo, useState } from "react"
import PracticeReviewCard from "@/components/practice/PracticeReviewCard"
import type { PracticeNoteCategory } from "@/lib/loaders/practice-diary"
import type { ReviewQueueItem } from "@/lib/loaders/review"
import type { BacklogGroupSummary, BacklogTier } from "@/lib/types"

type CatchUpSectionProps = {
  catchUpQueue: ReviewQueueItem[]
  backlogSummary: BacklogGroupSummary[]
  redirectTo: string
  defaultOpen?: boolean
  practiceDiaryEnabled: boolean
  noteCategories: PracticeNoteCategory[]
}

function getStatusBadgeClasses(label: string | null) {
  switch (label) {
    case "Due now":
      return "border border-warning bg-warning/30 text-warning-foreground"
    case "Overdue":
      return "border border-destructive/40 bg-destructive/15 text-destructive"
    case "Overdue (longest)":
      return "border border-destructive bg-destructive/20 text-destructive"
    default:
      return "border border-border bg-muted text-muted-foreground"
  }
}

function getSummaryFilterLabel(tier: BacklogTier) {
  switch (tier) {
    case "due_now":
      return "1–7 days late"
    case "overdue":
      return "8–21 days late"
    case "overdue_longest":
      return "22+ days late"
  }
}

function getActiveFilterText(tier: BacklogTier) {
  switch (tier) {
    case "due_now":
      return "Due now, 1–7 days late"
    case "overdue":
      return "Overdue, 8–21 days late"
    case "overdue_longest":
      return "Overdue, 22+ days late"
  }
}

export default function CatchUpSection({
  catchUpQueue,
  backlogSummary,
  redirectTo,
  defaultOpen = false,
  practiceDiaryEnabled,
  noteCategories,
}: CatchUpSectionProps) {
  const [activeTier, setActiveTier] = useState<BacklogTier | null>(null)

  const visibleCatchUpQueue = useMemo(() => {
    if (!activeTier) {
      return catchUpQueue
    }

    return catchUpQueue.filter(
      (userPiece) => userPiece.backlog_tier === activeTier
    )
  }, [activeTier, catchUpQueue])

  return (
    <section
      id="catch-up"
      className="mt-5 rounded-2xl border border-border bg-card p-4 shadow-sm md:mt-8 md:rounded-3xl md:p-6"
    >
      <details open={defaultOpen}>
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground md:text-sm">
          Catch up ({catchUpQueue.length})
        </summary>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Catch up on overdue tunes.
        </p>

        {catchUpQueue.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
            Nothing overdue right now.
          </p>
        ) : (
          <>
            <ul className="mt-4 grid gap-2 md:mt-5 md:grid-cols-3 md:gap-3">
              {backlogSummary.map((group) => {
                const isActive = activeTier === group.tier

                return (
                  <li key={group.tier}>
                    <button
                      type="button"
                      aria-pressed={isActive}
                      onClick={() =>
                        setActiveTier((currentTier) =>
                          currentTier === group.tier ? null : group.tier
                        )
                      }
                      className={`flex w-full items-center justify-between rounded-2xl border border-border bg-background/70 px-3 py-3 text-left transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] md:px-4 ${
                        isActive ? "ring-2 ring-[var(--focus-ring)]" : ""
                      }`}
                    >
                      <span className="text-sm font-semibold text-foreground">
                        {getSummaryFilterLabel(group.tier)}
                      </span>
                      <span className="text-sm font-medium text-muted-foreground">
                        {group.count}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>

            {activeTier ? (
              <p className="mt-4 rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                Filter applied:{" "}
                <span className="font-semibold text-foreground">
                  {getActiveFilterText(activeTier)}
                </span>
                . Showing {visibleCatchUpQueue.length} of {catchUpQueue.length}{" "}
                catch-up tunes. Click the same filter again to show all.
              </p>
            ) : (
              <p className="mt-4 rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                No filter applied. Showing all {catchUpQueue.length} catch-up
                tunes.
              </p>
            )}

            <div className="mt-4 grid gap-4 md:mt-6 md:grid-cols-2 xl:grid-cols-3">
              {visibleCatchUpQueue.map((userPiece) => (
                <PracticeReviewCard
                  key={userPiece.id}
                  userPiece={userPiece}
                  redirectTo={redirectTo}
                  badgeLabel={userPiece.backlog_label ?? "Overdue"}
                  badgeClassName={getStatusBadgeClasses(
                    userPiece.backlog_label
                  )}
                  practiceDiaryEnabled={practiceDiaryEnabled}
                  noteCategories={noteCategories}
                />
              ))}
            </div>
          </>
        )}
      </details>
    </section>
  )
}