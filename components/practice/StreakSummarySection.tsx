import type { StreakSummary } from "@/lib/types"

type StreakSummarySectionProps = {
  streakSummary: StreakSummary
}

export default function StreakSummarySection({
  streakSummary,
}: StreakSummarySectionProps) {
  return (
    <section className="rounded-2xl border border-[#b0bc8c] bg-[#e4ead8] p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#596650]">
        Streaks
      </h2>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[#b0bc8c] bg-[#f3f7ea]/70 p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#596650]">
            Revision streak
          </p>
          <p className="mt-2 font-serif text-5xl font-bold">
            {streakSummary.current_revision_streak}
          </p>
          <p className="mt-2 text-sm text-[#596650]">
            Longest: {streakSummary.longest_revision_streak}
          </p>
          <p className="mt-3 text-sm text-[#596650]">
            Cleared all due tunes
          </p>
        </div>

        <div className="rounded-2xl border border-[#b0bc8c] bg-[#f3f7ea]/70 p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#596650]">
            Practice streak
          </p>
          <p className="mt-2 font-serif text-5xl font-bold">
            {streakSummary.current_practice_streak}
          </p>
          <p className="mt-2 text-sm text-[#596650]">
            Longest: {streakSummary.longest_practice_streak}
          </p>
          <p className="mt-3 text-sm text-[#596650]">
            Did any qualifying practice activity
          </p>
        </div>
      </div>
    </section>
  )
}