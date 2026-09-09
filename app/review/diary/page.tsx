import PracticeDiaryNav from "@/components/practice-diary/PracticeDiaryNav"
import PracticeDayView from "@/components/practice-diary/PracticeDayView"
import PracticeMonthView from "@/components/practice-diary/PracticeMonthView"
import PracticePeriodHeader from "@/components/practice-diary/PracticePeriodHeader"
import PracticeWeekView from "@/components/practice-diary/PracticeWeekView"
import PageHeader from "@/components/ui/PageHeader"
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
    tab?: string
    diary?: string
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

function getDiaryStatus(value: string | undefined) {
  if (value === "reflection_saved") return "Reflection saved."
  if (value === "note_saved") return "Note saved."
  if (value === "note_updated") return "Note updated."
  if (value === "note_deleted") return "Note deleted."
  if (value === "empty_note") return "Write something before saving the note."
  if (value === "invalid_note_context") return "That note changed elsewhere. Refresh and try again."
  if (value === "invalid_category") return "That note category is no longer available."
  if (value === "missing_piece" || value === "missing_note") return "That item is no longer available."
  return null
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
  const activeTab = resolvedSearchParams?.tab
  const statusMessage = getDiaryStatus(resolvedSearchParams?.diary)

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

  const period = diaryData
    ? {
        label: diaryData.selectedDate === diaryData.today ? "Today" : diaryData.selectedDate,
        previousDate: diaryData.previousDate,
        currentDate: diaryData.today,
        nextDate: diaryData.nextDate,
      }
    : weekData
      ? {
          label: `${weekData.weekStartDate} – ${weekData.weekEndDate}`,
          previousDate: weekData.previousWeekDate,
          currentDate: weekData.currentWeekDate,
          nextDate: weekData.nextWeekDate,
        }
      : {
          label: monthData?.monthStartDate.slice(0, 7) ?? selectedDate.slice(0, 7),
          previousDate: monthData?.previousMonthDate ?? selectedDate,
          currentDate: monthData?.currentMonthDate ?? selectedDate,
          nextDate: monthData?.nextMonthDate ?? selectedDate,
        }

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-5 text-foreground md:px-6 md:py-8">
      <PageHeader title="Practice Diary" />

      <section className="mb-5 space-y-5 md:mb-6">
        <PracticeDiaryNav active="diary" />
        <PracticePeriodHeader activeView={activeView} selectedDate={selectedDate} {...period} />
      </section>

      {statusMessage ? (
        <p role="status" className="mb-5 border-l-4 border-primary bg-card px-4 py-3 text-sm font-medium text-foreground">
          {statusMessage}
        </p>
      ) : null}

      {activeView === "day" ? (
        diaryData ? (
          <PracticeDayView data={diaryData} />
        ) : null
      ) : activeView === "week" ? (
        weekData ? (
          <PracticeWeekView data={weekData} activeTab={activeTab} />
        ) : null
      ) : monthData ? (
        <PracticeMonthView data={monthData} activeTab={activeTab} />
      ) : null}
    </main>
  )
}
