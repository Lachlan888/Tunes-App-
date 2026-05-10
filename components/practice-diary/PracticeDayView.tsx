import DailyReflectionForm from "@/components/practice-diary/DailyReflectionForm"
import PracticeCategoryManager from "@/components/practice-diary/PracticeCategoryManager"
import PracticeDayNavigator from "@/components/practice-diary/PracticeDayNavigator"
import PracticeEventList from "@/components/practice-diary/PracticeEventList"
import PracticeNoteForm from "@/components/practice-diary/PracticeNoteForm"
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

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1fr_1.25fr]">
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
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Loose notes
            </h2>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Add extra notes that are not attached to one specific reviewed
              tune. Use this for reminders, observations, or small practice
              thoughts that do not belong in the main session summary.
            </p>

            {data.unlinkedNotes.length > 0 ? (
              <ul className="mt-5 space-y-3">
                {data.unlinkedNotes.map((note) => (
                  <li
                    key={note.id}
                    className="rounded-2xl border border-border bg-background/70 p-4"
                  >
                    {note.category ? (
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        {note.category.name}
                      </p>
                    ) : null}

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">
                      {note.body}
                    </p>
                  </li>
                ))}
              </ul>
            ) : null}

            <PracticeNoteForm
              practiceDate={data.selectedDate}
              redirectTo={redirectTo}
              categories={data.categories}
              label="Add loose note"
              placeholder="What else do you want to remember about today?"
            />
          </section>
        </section>

        <section className="space-y-6">
          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Tune notes
            </h2>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Reviewed tunes and tune-specific notes for this day. These notes
              also appear on each tune’s Practice history.
            </p>
          </section>

          <PracticeEventList
            events={data.events}
            categories={data.categories}
            practiceDate={data.selectedDate}
            redirectTo={redirectTo}
          />
        </section>
      </div>
    </div>
  )
}