import type { StreakSummary } from "@/lib/types"

type StreakSummarySectionProps = {
  streakSummary: StreakSummary
}

export default function StreakSummarySection({
  streakSummary,
}: StreakSummarySectionProps) {
  return (
    <section className="rounded-2xl border border-success bg-success/15 p-4 shadow-sm md:p-5">
      <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground md:text-sm">
        Streaks
      </h2>

      <div className="mt-3 grid grid-cols-2 gap-2 md:mt-4 md:gap-4">
        <div className="rounded-2xl border border-border bg-background/70 p-3 md:p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground md:text-sm md:tracking-[0.16em]">
            Revision
          </p>
          <p className="mt-2 font-serif text-3xl font-bold leading-none text-foreground md:text-5xl">
            {streakSummary.current_revision_streak}
          </p>
          <p className="mt-2 text-xs text-muted-foreground md:text-sm">
            Longest: {streakSummary.longest_revision_streak}
          </p>
          <p className="mt-2 hidden text-sm text-muted-foreground md:block">
            Cleared all due tunes
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-background/70 p-3 md:p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground md:text-sm md:tracking-[0.16em]">
            Practice
          </p>
          <p className="mt-2 font-serif text-3xl font-bold leading-none text-foreground md:text-5xl">
            {streakSummary.current_practice_streak}
          </p>
          <p className="mt-2 text-xs text-muted-foreground md:text-sm">
            Longest: {streakSummary.longest_practice_streak}
          </p>
          <p className="mt-2 hidden text-sm text-muted-foreground md:block">
            Did any qualifying practice activity
          </p>
        </div>
      </div>
    </section>
  )
}