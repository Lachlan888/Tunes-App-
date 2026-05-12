import Link from "next/link"

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
      className="flex flex-wrap gap-2"
      aria-label="Practice diary view options"
    >
      {views.map((view) => {
        const isActive = activeView === view.value
        const href = `/review/diary?view=${view.value}&date=${selectedDate}`

        return (
          <Link
            key={view.value}
            href={href}
            className={
              isActive
                ? "rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm"
                : "rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-muted hover:text-foreground"
            }
          >
            <span>{view.label}</span>
            <span className="sr-only">, {view.description}</span>
          </Link>
        )
      })}
    </nav>
  )
}