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
    <main className="mx-auto max-w-[1500px] px-6 py-8 text-foreground">
      <section className="mb-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Practice
        </p>

        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight md:text-5xl">
          Practice diary
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
          A date-bound practice notebook for session summaries, reviewed tunes,
          and tune-specific notes.
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