import type { StreakSummary } from "@/lib/types"

type StreakSummarySectionProps = {
  streakSummary: StreakSummary
}

export default function StreakSummarySection({
  streakSummary,
}: StreakSummarySectionProps) {
  return (
    <section>
      <h2 className="mb-4 text-2xl font-semibold">Streaks</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-600">Revision streak</p>
          <p className="mt-1 text-3xl font-bold">
            {streakSummary.current_revision_streak}
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Longest: {streakSummary.longest_revision_streak}
          </p>
          <p className="mt-3 text-sm text-gray-600">
            Cleared all due tunes
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-600">Practice streak</p>
          <p className="mt-1 text-3xl font-bold">
            {streakSummary.current_practice_streak}
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Longest: {streakSummary.longest_practice_streak}
          </p>
          <p className="mt-3 text-sm text-gray-600">
            Did any qualifying practice activity
          </p>
        </div>
      </div>
    </section>
  )
}