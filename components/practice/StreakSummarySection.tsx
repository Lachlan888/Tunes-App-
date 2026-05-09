import type { StreakSummary } from "@/lib/types"

type StreakSummarySectionProps = {
  streakSummary: StreakSummary
}

export default function StreakSummarySection({
  streakSummary,
}: StreakSummarySectionProps) {
  return (
    <section className="rounded-2xl border border-success bg-success/15 p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Streaks
      </h2>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-background/70 p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Revision streak
          </p>
          <p className="mt-2 font-serif text-5xl font-bold text-foreground">
            {streakSummary.current_revision_streak}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Longest: {streakSummary.longest_revision_streak}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Cleared all due tunes
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-background/70 p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Practice streak
          </p>
          <p className="mt-2 font-serif text-5xl font-bold text-foreground">
            {streakSummary.current_practice_streak}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Longest: {streakSummary.longest_practice_streak}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Did any qualifying practice activity
          </p>
        </div>
      </div>
    </section>
  )
}