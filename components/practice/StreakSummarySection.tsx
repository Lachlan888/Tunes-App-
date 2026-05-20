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
    <div className="min-w-0 md:rounded-2xl md:border md:border-border md:bg-background/70 md:p-4">
      <p className="text-sm font-semibold leading-6 text-foreground md:text-sm md:uppercase md:tracking-[0.16em] md:text-muted-foreground">
        {label}
      </p>

      <div className="mt-1 flex flex-wrap items-end gap-x-2 gap-y-1 md:block">
        <p className="font-serif text-4xl font-bold leading-none text-foreground md:text-5xl">
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
        "md:rounded-2xl md:border md:border-success md:bg-success/15 md:p-5 md:shadow-sm",
        className
      )}
    >
      <h2 className="px-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground md:px-0 md:text-sm">
        Streaks
      </h2>

      <div className="mt-3 grid grid-cols-2 gap-4 md:mt-4 md:gap-4">
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