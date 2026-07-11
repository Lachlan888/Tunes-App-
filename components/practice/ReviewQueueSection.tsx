"use client"

import Link from "next/link"
import CardPager from "@/components/ui/CardPager"
import PracticeReviewCard from "@/components/practice/PracticeReviewCard"
import { joinClasses } from "@/components/ui/buttonStyles"
import type { PracticeNoteCategory } from "@/lib/loaders/practice-diary"
import type { ReviewQueueItem } from "@/lib/loaders/review"

type ReviewQueueMode = "due-today" | "catch-up"

type ReviewQueueSectionProps = {
  dueTodayPieces: ReviewQueueItem[]
  catchUpQueue: ReviewQueueItem[]
  activeMode: ReviewQueueMode
  dueTodayRedirectTo: string
  catchUpRedirectTo: string
  practiceDiaryEnabled: boolean
  noteCategories: PracticeNoteCategory[]
}

function pluraliseTunes(count: number) {
  return `${count} tune${count === 1 ? "" : "s"}`
}

function QueueModeLink({
  href,
  label,
  count,
  helper,
  isActive,
}: {
  href: string
  label: string
  count: number
  helper: string
  isActive: boolean
}) {
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={joinClasses(
        "rounded-2xl border p-4 text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]",
        isActive
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background/70 text-foreground hover:bg-muted"
      )}
    >
      <span
        className={joinClasses(
          "text-xs font-semibold uppercase tracking-[0.14em]",
          isActive ? "text-primary-foreground/85" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
      <span className="mt-2 block font-serif text-4xl font-bold leading-none">
        {count}
      </span>
      <span
        className={joinClasses(
          "mt-2 block text-sm leading-5",
          isActive ? "text-primary-foreground/85" : "text-muted-foreground"
        )}
      >
        {helper}
      </span>
    </Link>
  )
}

export default function ReviewQueueSection({
  dueTodayPieces,
  catchUpQueue,
  activeMode,
  dueTodayRedirectTo,
  catchUpRedirectTo,
  practiceDiaryEnabled,
  noteCategories,
}: ReviewQueueSectionProps) {
  const activeQueue =
    activeMode === "catch-up" ? catchUpQueue : dueTodayPieces
  const activeRedirectTo =
    activeMode === "catch-up" ? catchUpRedirectTo : dueTodayRedirectTo
  const badgeLabel = activeMode === "catch-up" ? "Overdue" : "Due today"
  const badgeClassName =
    activeMode === "catch-up"
      ? "border border-destructive/40 bg-destructive/15 text-destructive"
      : "border border-accent bg-accent/20 text-accent-foreground"
  const emptyMessage =
    activeMode === "catch-up"
      ? "Nothing overdue right now."
      : "No tunes due today."
  const totalAttentionCount = dueTodayPieces.length + catchUpQueue.length

  return (
    <section
      id="review-queue"
      className="scroll-mt-4 rounded-3xl border border-primary bg-card p-4 shadow-sm md:scroll-mt-6 md:p-6"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Review queue
          </p>
          <h2 className="mt-2 font-serif text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
            Complete today&apos;s reviews
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            {totalAttentionCount === 0
              ? "You have no reviews needing attention right now."
              : `${pluraliseTunes(
                  totalAttentionCount
                )} need attention: ${dueTodayPieces.length} due today and ${
                  catchUpQueue.length
                } overdue.`}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            {activeQueue.length}
          </span>{" "}
          in current lane
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <QueueModeLink
          href="/review#review-queue"
          label="Due today"
          count={dueTodayPieces.length}
          helper="Scheduled for today"
          isActive={activeMode === "due-today"}
        />
        <QueueModeLink
          href="/review?mode=catch-up#review-queue"
          label="Catch-up"
          count={catchUpQueue.length}
          helper="Overdue reviews"
          isActive={activeMode === "catch-up"}
        />
      </div>

      <div className="mt-5 md:mt-6">
        <CardPager
          items={activeQueue}
          getKey={(userPiece) => userPiece.id}
          label={
            activeMode === "catch-up"
              ? "Catch-up review queue"
              : "Due today review queue"
          }
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
              redirectTo={activeRedirectTo}
              badgeLabel={badgeLabel}
              badgeClassName={badgeClassName}
              practiceDiaryEnabled={practiceDiaryEnabled}
              noteCategories={noteCategories}
            />
          )}
        />
      </div>
    </section>
  )
}
