import type { StreakSummary } from "@/lib/types"

type StreakSummarySectionProps = {
  streakSummary: StreakSummary
  className?: string
}

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

function StreakItem({
  label,
  current,
  best,
  desktopHelper,
}: {
  label: string
  current: number
  best: number
  desktopHelper: string
}) {
  return (
    <div className="min-w-0 border-t border-hairline pt-4 first:border-t-0 first:pt-0 md:border-l md:border-t-0 md:pl-5 md:pt-0 md:first:border-l-0 md:first:pl-0">
      <p className="text-sm font-semibold leading-6 text-foreground">
        {label}
      </p>

      <div className="mt-1 flex flex-wrap items-end gap-x-2 gap-y-1 md:block">
        <p className="font-sans text-4xl font-bold leading-none text-foreground md:text-5xl">
          {current}
        </p>

        <p className="pb-1 text-sm font-medium leading-none text-muted-foreground md:mt-2 md:pb-0 md:leading-5">
          Best {best}
        </p>
      </div>

      <p className="mt-2 hidden text-sm text-muted-foreground md:block">
        {desktopHelper}
      </p>
    </div>
  )
}

export default function StreakSummarySection({
  streakSummary,
  className,
}: StreakSummarySectionProps) {
  return (
    <section
      className={joinClasses(
        "border-t border-hairline pt-5",
        className
      )}
    >
      <h2 className="text-xl font-bold tracking-tight text-foreground">
        Streaks
      </h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 md:gap-5">
        <StreakItem
          label="Revision"
          current={streakSummary.current_revision_streak}
          best={streakSummary.longest_revision_streak}
          desktopHelper="Cleared all due tunes"
        />

        <StreakItem
          label="Practice"
          current={streakSummary.current_practice_streak}
          best={streakSummary.longest_practice_streak}
          desktopHelper="Did any qualifying practice activity"
        />
      </div>
    </section>
  )
}
