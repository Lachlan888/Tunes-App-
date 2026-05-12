import DailyReflectionForm from "@/components/practice-diary/DailyReflectionForm"
import PracticeCategoryManager from "@/components/practice-diary/PracticeCategoryManager"
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
    <div className="space-y-6">
      <PracticeDayNavigator
        selectedDate={data.selectedDate}
        previousDate={data.previousDate}
        nextDate={data.nextDate}
        today={data.today}
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.6fr]">
        <aside className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Practice categories
          </h2>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            These are your own ways of thinking about tunes. Use them to tag
            what a note is really about: tempo, form, variations, harmony,
            technique, or any other pattern you want to track.
          </p>

          <div className="mt-5 rounded-2xl border border-border bg-background/70 p-4">
            <p className="text-sm font-semibold text-foreground">
              Why this matters
            </p>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Categories turn a pile of notes into something searchable and
              meaningful. A tune can be solid in form but weak in tempo, or
              technically clean but missing variation ideas.
            </p>
          </div>

          <div className="mt-5">
            <PracticeCategoryManager
              categories={data.categories}
              redirectTo={redirectTo}
            />
          </div>
        </aside>

        <section className="space-y-6">
          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Session summary
            </h2>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Write one overall reflection for the day. This is for the general
              shape of the session: energy, patterns, problems, breakthroughs,
              and what you want to remember next time.
            </p>

            <div className="mt-5">
              <DailyReflectionForm
                practiceDate={data.selectedDate}
                redirectTo={redirectTo}
                initialValue={data.practiceDay?.daily_reflection ?? ""}
              />
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Due on this day
                </h2>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Tunes currently scheduled for review on this date, according
                  to the current review database.
                </p>
              </div>

              <p className="text-sm font-medium text-muted-foreground">
                {data.dueTunes.length} due
              </p>
            </div>

            <div className="mt-5">
              <PracticeDueTuneList
                dueTunes={data.dueTunes}
                emptyMessage="No active-practice tunes are currently due on this day."
              />
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Tune notes
            </h2>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Reviewed tunes and tune-specific notes for this day. These notes
              also appear on each tune’s Practice history.
            </p>

            <div className="mt-5">
              <PracticeEventList
                events={data.events}
                categories={data.categories}
                practiceDate={data.selectedDate}
                redirectTo={redirectTo}
              />
            </div>
          </section>
        </section>
      </div>
    </div>
  )
}