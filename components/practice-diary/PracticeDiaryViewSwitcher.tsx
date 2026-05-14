import Link from "next/link"
import { joinClasses } from "@/components/ui/buttonStyles"

type PracticeDiaryView = "day" | "week" | "month"

type PracticeDiaryViewSwitcherProps = {
  activeView: PracticeDiaryView
  selectedDate: string
}

const views: {
  value: PracticeDiaryView
  label: string
  description: string
}[] = [
  {
    value: "day",
    label: "Day",
    description: "Detailed notes",
  },
  {
    value: "week",
    label: "Week",
    description: "Patterns",
  },
  {
    value: "month",
    label: "Month",
    description: "Coverage",
  },
]

export default function PracticeDiaryViewSwitcher({
  activeView,
  selectedDate,
}: PracticeDiaryViewSwitcherProps) {
  return (
    <nav
      className="grid grid-cols-3 gap-2 md:flex md:flex-wrap"
      aria-label="Practice diary view options"
    >
      {views.map((view) => {
        const isActive = activeView === view.value
        const href = `/review/diary?view=${view.value}&date=${selectedDate}`

        return (
          <Link
            key={view.value}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={joinClasses(
              "rounded-full border px-3 py-2 text-center text-sm font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] md:px-4",
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background/70 text-muted-foreground hover:-translate-y-0.5 hover:bg-muted hover:text-foreground"
            )}
          >
            <span>{view.label}</span>
            <span className="sr-only">, {view.description}</span>
          </Link>
        )
      })}
    </nav>
  )
}