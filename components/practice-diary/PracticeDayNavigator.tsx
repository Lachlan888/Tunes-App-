import Link from "next/link"
import PracticeDayCalendarPicker from "@/components/practice-diary/PracticeDayCalendarPicker"

type PracticeDayNavigatorProps = {
  selectedDate: string
  previousDate: string
  nextDate: string
  today: string
}

const secondaryLinkClassName =
  "inline-flex min-h-10 items-center justify-center rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"

const primaryLinkClassName =
  "inline-flex min-h-10 items-center justify-center rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"

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
    <section className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-between">
        <Link href={previousHref} className={secondaryLinkClassName}>
          Previous day
        </Link>

        <Link href={nextHref} className={secondaryLinkClassName}>
          Next day
        </Link>
      </div>

      <PracticeDayCalendarPicker selectedDate={selectedDate} today={today} />

      {selectedDate !== today ? (
        <div className="flex justify-center">
          <Link href="/review/diary" className={primaryLinkClassName}>
            Today
          </Link>
        </div>
      ) : null}
    </section>
  )
}