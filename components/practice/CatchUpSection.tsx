"use client"

import { useMemo, useState } from "react"
import CardPager from "@/components/ui/CardPager"
import PracticeReviewCard from "@/components/practice/PracticeReviewCard"
import { joinClasses } from "@/components/ui/buttonStyles"
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

type CatchUpFilter = "all" | BacklogTier

type FilterOption = {
  value: CatchUpFilter
  label: string
  count: number
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
      return "1–7"
    case "overdue":
      return "8–21"
    case "overdue_longest":
      return "22+"
  }
}

function getLongFilterLabel(tier: BacklogTier) {
  switch (tier) {
    case "due_now":
      return "1–7 days late"
    case "overdue":
      return "8–21 days late"
    case "overdue_longest":
      return "22+ days late"
  }
}

function getFilterDescription(activeFilter: CatchUpFilter) {
  if (activeFilter === "all") {
    return "Showing all catch-up tunes."
  }

  return `Showing ${getLongFilterLabel(activeFilter)}.`
}

function getBacklogCount(
  backlogSummary: BacklogGroupSummary[],
  tier: BacklogTier
) {
  return backlogSummary.find((group) => group.tier === tier)?.count ?? 0
}

function CatchUpReviewPager({
  queue,
  redirectTo,
  practiceDiaryEnabled,
  noteCategories,
  emptyMessage,
}: {
  queue: ReviewQueueItem[]
  redirectTo: string
  practiceDiaryEnabled: boolean
  noteCategories: PracticeNoteCategory[]
  emptyMessage: string
}) {
  return (
    <CardPager
      items={queue}
      getKey={(userPiece) => userPiece.id}
      label="Catch-up review queue"
      previousLabel="Previous"
      nextLabel="Next"
      unstyledCard
      emptyState={
        <p className="rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      }
      renderItem={(userPiece) => (
        <PracticeReviewCard
          userPiece={userPiece}
          redirectTo={redirectTo}
          badgeLabel={userPiece.backlog_label ?? "Overdue"}
          badgeClassName={getStatusBadgeClasses(userPiece.backlog_label)}
          practiceDiaryEnabled={practiceDiaryEnabled}
          noteCategories={noteCategories}
        />
      )}
    />
  )
}

export default function CatchUpSection({
  catchUpQueue,
  backlogSummary,
  redirectTo,
  defaultOpen = false,
  practiceDiaryEnabled,
  noteCategories,
}: CatchUpSectionProps) {
  const [activeFilter, setActiveFilter] = useState<CatchUpFilter>("all")

  const visibleCatchUpQueue = useMemo(() => {
    if (activeFilter === "all") {
      return catchUpQueue
    }

    return catchUpQueue.filter(
      (userPiece) => userPiece.backlog_tier === activeFilter
    )
  }, [activeFilter, catchUpQueue])

  const filterOptions: FilterOption[] = [
    {
      value: "all",
      label: "All",
      count: catchUpQueue.length,
    },
    {
      value: "due_now",
      label: getSummaryFilterLabel("due_now"),
      count: getBacklogCount(backlogSummary, "due_now"),
    },
    {
      value: "overdue",
      label: getSummaryFilterLabel("overdue"),
      count: getBacklogCount(backlogSummary, "overdue"),
    },
    {
      value: "overdue_longest",
      label: getSummaryFilterLabel("overdue_longest"),
      count: getBacklogCount(backlogSummary, "overdue_longest"),
    },
  ]

  return (
    <section id="catch-up" className="mt-6 md:mt-8">
      <div className="md:hidden">
        {catchUpQueue.length === 0 ? (
          <p className="rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
            Nothing overdue right now.
          </p>
        ) : (
          <CatchUpReviewPager
            queue={catchUpQueue}
            redirectTo={redirectTo}
            practiceDiaryEnabled={practiceDiaryEnabled}
            noteCategories={noteCategories}
            emptyMessage="Nothing overdue right now."
          />
        )}
      </div>

      <div className="hidden md:block">
        <details open={defaultOpen}>
          <summary className="cursor-pointer px-1 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Catch up ({catchUpQueue.length})
          </summary>

          {catchUpQueue.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
              Nothing overdue right now.
            </p>
          ) : (
            <div className="mt-4 grid gap-4">
              <p className="px-1 text-sm leading-6 text-muted-foreground">
                Catch up on overdue tunes one at a time.
              </p>

              <div
                className="grid grid-cols-4 rounded-full border border-border bg-background/70 p-1 shadow-sm"
                role="tablist"
                aria-label="Catch-up backlog filter"
              >
                {filterOptions.map((option) => {
                  const isActive = activeFilter === option.value

                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveFilter(option.value)}
                      className={joinClasses(
                        "min-h-10 rounded-full px-2 py-2 text-center text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <span className="block leading-tight">
                        {option.label}
                      </span>
                      <span className="block text-[0.68rem] leading-tight opacity-80">
                        {option.count}
                      </span>
                    </button>
                  )
                })}
              </div>

              <p className="px-1 text-sm leading-6 text-muted-foreground">
                {getFilterDescription(activeFilter)}{" "}
                {visibleCatchUpQueue.length} of {catchUpQueue.length} tunes.
              </p>

              <CatchUpReviewPager
                queue={visibleCatchUpQueue}
                redirectTo={redirectTo}
                practiceDiaryEnabled={practiceDiaryEnabled}
                noteCategories={noteCategories}
                emptyMessage="No catch-up tunes match this filter."
              />
            </div>
          )}
        </details>
      </div>
    </section>
  )
}