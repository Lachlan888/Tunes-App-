import Link from "next/link"
import Icon from "@/components/ui/Icon"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import type { ReviewQueueItem } from "@/lib/loaders/review"
import { getPracticeSessionHref, type PracticeLane } from "@/lib/practice-session"

function LaneLink({
  lane,
  count,
  title,
  detail,
  recommended,
}: {
  lane: PracticeLane
  count: number
  title: string
  detail: string
  recommended: boolean
}) {
  const disabled = count === 0

  return (
    <Link
      href={disabled ? "/review" : getPracticeSessionHref(lane)}
      aria-disabled={disabled || undefined}
      className={joinClasses(
        "flex min-h-20 items-center justify-between gap-4 border-b border-hairline px-1 py-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] md:rounded-object md:border md:bg-surface-paper md:px-4 md:shadow-material-rest",
        disabled && "pointer-events-none opacity-55"
      )}
    >
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-text-primary">{title}</span>
          {recommended ? (
            <span className="rounded-pill bg-state-practice px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-state-practice-foreground">
              Continue
            </span>
          ) : null}
        </span>
        <span className="mt-1 block text-sm text-text-muted">{detail}</span>
      </span>
      <span className="flex shrink-0 items-center gap-3">
        <span className="font-serif text-3xl font-bold">{count}</span>
        <Icon name="practice" />
      </span>
    </Link>
  )
}

export default function ReviewQueueSection({
  dueTodayPieces,
  catchUpQueue,
}: {
  dueTodayPieces: ReviewQueueItem[]
  catchUpQueue: ReviewQueueItem[]
}) {
  const recommendedLane: PracticeLane | null =
    dueTodayPieces.length > 0
      ? "due-today"
      : catchUpQueue.length > 0
        ? "catch-up"
        : null

  return (
    <section id="review-queue" className="mt-4 scroll-mt-4 md:mt-6 md:scroll-mt-6">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-hairline pb-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">Choose a lane</p>
          <h2 className="mt-1 font-serif text-2xl font-bold">Practise what needs attention</h2>
        </div>
        {recommendedLane ? (
          <Link href={getPracticeSessionHref(recommendedLane)} className={buttonStyles.practice}>
            Continue Practice
          </Link>
        ) : null}
      </div>

      <div className="mt-2 grid md:grid-cols-2 md:gap-3">
        <LaneLink
          lane="due-today"
          count={dueTodayPieces.length}
          title="Due today"
          detail="Scheduled reviews ready now"
          recommended={recommendedLane === "due-today"}
        />
        <LaneLink
          lane="catch-up"
          count={catchUpQueue.length}
          title="Catch-up"
          detail="Oldest overdue tunes first"
          recommended={recommendedLane === "catch-up"}
        />
      </div>

      {!recommendedLane ? (
        <div className="mt-5 border-y border-dashed border-hairline py-5 text-sm text-text-muted md:rounded-object md:border md:bg-surface-note md:px-5">
          <p className="font-semibold text-text-primary">Your review lanes are clear.</p>
          <p className="mt-1 leading-6">Use a List or Focus area when you want an unscheduled practice session.</p>
        </div>
      ) : null}

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <Link href="/learning-lists?view=learning-queue" className="min-h-14 border-y border-hairline px-2 py-3 font-semibold text-text-muted hover:text-text-primary md:rounded-control md:border md:bg-surface-paper">
          From learning queue
        </Link>
        <Link href="/review/foci" className="min-h-14 border-y border-hairline px-2 py-3 font-semibold text-text-muted hover:text-text-primary md:rounded-control md:border md:bg-surface-paper">
          From focus areas
        </Link>
      </div>
    </section>
  )
}
