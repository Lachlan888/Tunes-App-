import DailyReflectionForm from "@/components/practice-diary/DailyReflectionForm"
import PracticeCategoryManagerModal from "@/components/practice-diary/PracticeCategoryManagerModal"
import PracticeDayNavigator from "@/components/practice-diary/PracticeDayNavigator"
import PracticeDueTuneList from "@/components/practice-diary/PracticeDueTuneList"
import PracticeEventList from "@/components/practice-diary/PracticeEventList"
import type { PracticeDiaryDayDataWithNotes } from "@/lib/loaders/practice-diary"

type PracticeDayViewProps = {
  data: PracticeDiaryDayDataWithNotes
}

export default function PracticeDayView({ data }: PracticeDayViewProps) {
  const redirectTo =
    data.selectedDate === data.today
      ? "/review/diary"
      : `/review/diary?date=${data.selectedDate}`

  return (
    <div className="space-y-5 md:space-y-6">
      <PracticeDayNavigator
        selectedDate={data.selectedDate}
        previousDate={data.previousDate}
        nextDate={data.nextDate}
        today={data.today}
      />

      <section className="space-y-5 md:space-y-6">
        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:rounded-3xl md:p-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground md:text-sm">
            Session summary
          </h2>

          <p className="mt-3 hidden text-sm leading-6 text-muted-foreground md:block">
            Write one overall reflection for the day: energy, patterns,
            problems, breakthroughs, or what you want to remember next time.
          </p>

          <div className="mt-4 md:mt-5">
            <DailyReflectionForm
              practiceDate={data.selectedDate}
              redirectTo={redirectTo}
              initialValue={data.practiceDay?.daily_reflection ?? ""}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:rounded-3xl md:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground md:text-sm">
                Due on this day
              </h2>

              <p className="mt-3 hidden text-sm leading-6 text-muted-foreground md:block">
                Tunes scheduled for review on this date.
              </p>
            </div>

            <p className="text-sm font-medium text-muted-foreground">
              {data.dueTunes.length} due
            </p>
          </div>

          <div className="mt-4 md:mt-5">
            <PracticeDueTuneList
              dueTunes={data.dueTunes}
              emptyMessage="No active-practice tunes are currently due on this day."
            />
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:rounded-3xl md:p-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground md:text-sm">
            Tune notes
          </h2>

          <p className="mt-3 hidden text-sm leading-6 text-muted-foreground md:block">
            Reviewed tunes and tune-specific notes for this day.
          </p>

          <div className="mt-4 md:mt-5">
            <PracticeEventList
              events={data.events}
              categories={data.categories}
              practiceDate={data.selectedDate}
              redirectTo={redirectTo}
            />
          </div>
        </section>

        <PracticeCategoryManagerModal
          categories={data.categories}
          redirectTo={redirectTo}
        />
      </section>
    </div>
  )
}