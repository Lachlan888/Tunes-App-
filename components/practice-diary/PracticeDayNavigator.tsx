import Link from "next/link"
import PracticeDayCalendarPicker from "@/components/practice-diary/PracticeDayCalendarPicker"

type PracticeDayNavigatorProps = {
  selectedDate: string
  previousDate: string
  nextDate: string
  today: string
}

export default function PracticeDayNavigator({
  selectedDate,
  previousDate,
  nextDate,
  today,
}: PracticeDayNavigatorProps) {
  const nextHref =
    nextDate === today ? "/review/diary" : `/review/diary?date=${nextDate}`

  const previousHref =
    previousDate === today
      ? "/review/diary"
      : `/review/diary?date=${previousDate}`

  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
        <Link
          href={previousHref}
          className="inline-flex justify-center rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-muted hover:text-foreground"
        >
          Previous day
        </Link>

        <PracticeDayCalendarPicker selectedDate={selectedDate} today={today} />

        <div className="flex flex-wrap justify-center gap-2 lg:justify-end">
          {selectedDate !== today && (
            <Link
              href="/review/diary"
              className="inline-flex justify-center rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover"
            >
              Today
            </Link>
          )}

          <Link
            href={nextHref}
            className="inline-flex justify-center rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-muted hover:text-foreground"
          >
            Next day
          </Link>
        </div>
      </div>
    </div>
  )
}