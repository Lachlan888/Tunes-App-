import Link from "next/link"
import { joinClasses } from "@/components/ui/buttonStyles"

type DiaryView = "day" | "week" | "month"

type PracticePeriodHeaderProps = {
  activeView: DiaryView
  selectedDate: string
  label: string
  previousDate: string
  currentDate: string
  nextDate: string
}

function href(view: DiaryView, date: string) {
  return `/review/diary?view=${view}&date=${date}`
}

export default function PracticePeriodHeader({
  activeView,
  selectedDate,
  label,
  previousDate,
  currentDate,
  nextDate,
}: PracticePeriodHeaderProps) {
  return (
    <section aria-label="Diary period controls" className="py-4 md:py-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Choose period" className="grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-2 sm:flex">
          <Link href={href(activeView, previousDate)} aria-label={`Previous ${activeView}`} className="flex min-h-11 min-w-11 items-center justify-center rounded-control border border-hairline bg-surface-paper px-3 font-semibold text-foreground hover:bg-surface-note focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]">←</Link>
          <Link href={href(activeView, currentDate)} className="flex min-h-11 min-w-0 items-center justify-center rounded-control border border-border bg-background px-4 text-center text-sm font-semibold text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]">
            <span className="truncate">{label}</span>
          </Link>
          <Link href={href(activeView, nextDate)} aria-label={`Next ${activeView}`} className="flex min-h-11 min-w-11 items-center justify-center rounded-control border border-hairline bg-surface-paper px-3 font-semibold text-foreground hover:bg-surface-note focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]">→</Link>
        </nav>

        <nav aria-label="Diary view" className="grid grid-cols-3 border-b border-hairline">
          {(["day", "week", "month"] as const).map((view) => (
            <Link
              key={view}
              href={href(view, selectedDate)}
              aria-current={activeView === view ? "page" : undefined}
              className={joinClasses(
                "flex min-h-11 items-center justify-center border-b-2 px-5 text-sm font-semibold capitalize focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--focus-ring)]",
                activeView === view ? "border-action-primary text-text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {view}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  )
}
