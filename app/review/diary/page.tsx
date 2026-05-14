import PracticeDiaryNav from "@/components/practice-diary/PracticeDiaryNav"
import PracticeDiaryViewSwitcher from "@/components/practice-diary/PracticeDiaryViewSwitcher"
import PracticeDayView from "@/components/practice-diary/PracticeDayView"
import PracticeMonthView from "@/components/practice-diary/PracticeMonthView"
import PracticeWeekView from "@/components/practice-diary/PracticeWeekView"
import {
  loadPracticeDiaryDayData,
  loadPracticeDiaryMonthData,
  loadPracticeDiaryWeekData,
  requirePracticeDiaryEnabled,
} from "@/lib/loaders/practice-diary"
import { getToday } from "@/lib/review"

type PracticeDiaryView = "day" | "week" | "month"

type PracticeDiaryPageProps = {
  searchParams?: Promise<{
    date?: string
    view?: string
  }>
}

function isValidDateOnly(value: string | undefined): value is string {
  if (!value) return false

  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function getDiaryView(value: string | undefined): PracticeDiaryView {
  if (value === "week" || value === "month") {
    return value
  }

  return "day"
}

function getViewDescription(activeView: PracticeDiaryView) {
  if (activeView === "week") {
    return "Weekly patterns, tunes touched, and category activity."
  }

  if (activeView === "month") {
    return "Monthly habit and coverage summary."
  }

  return "Daily notebook, reflection, due tunes, and tune notes."
}

export default async function PracticeDiaryPage({
  searchParams,
}: PracticeDiaryPageProps) {
  await requirePracticeDiaryEnabled()

  const resolvedSearchParams = await searchParams
  const selectedDate = isValidDateOnly(resolvedSearchParams?.date)
    ? resolvedSearchParams.date
    : getToday()
  const activeView = getDiaryView(resolvedSearchParams?.view)

  const diaryData =
    activeView === "day"
      ? await loadPracticeDiaryDayData(selectedDate)
      : null

  const weekData =
    activeView === "week"
      ? await loadPracticeDiaryWeekData(selectedDate)
      : null

  const monthData =
    activeView === "month"
      ? await loadPracticeDiaryMonthData(selectedDate)
      : null

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-5 text-foreground md:px-6 md:py-8">
      <section className="mb-5 rounded-2xl border border-border bg-card p-4 shadow-sm md:mb-6 md:rounded-3xl md:p-6">
        <p className="hidden text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground md:block">
          Practice
        </p>

        <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight md:mt-2 md:text-5xl">
          Practice diary
        </h1>

        <p className="mt-3 hidden max-w-3xl text-base leading-7 text-muted-foreground md:block">
          {getViewDescription(activeView)}
        </p>

        <PracticeDiaryNav active="diary" />

        <div className="mt-5">
          <PracticeDiaryViewSwitcher
            activeView={activeView}
            selectedDate={selectedDate}
          />
        </div>
      </section>

      {activeView === "day" ? (
        diaryData ? (
          <PracticeDayView data={diaryData} />
        ) : null
      ) : activeView === "week" ? (
        weekData ? (
          <PracticeWeekView data={weekData} />
        ) : null
      ) : monthData ? (
        <PracticeMonthView data={monthData} />
      ) : null}
    </main>
  )
}