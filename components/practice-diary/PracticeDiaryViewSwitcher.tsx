import Link from "next/link"
import { joinClasses } from "@/components/ui/buttonStyles"
import { segmentedControlStyles } from "@/components/ui/segmentedControlStyles"

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
      className={joinClasses(
        "grid grid-cols-3 md:flex md:flex-wrap",
        segmentedControlStyles.group
      )}
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
              segmentedControlStyles.item,
              "md:px-4",
              isActive
                ? segmentedControlStyles.active
                : segmentedControlStyles.inactive
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
