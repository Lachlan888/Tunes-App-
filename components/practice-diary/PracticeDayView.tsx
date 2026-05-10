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

      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Daily reflection
        </h2>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Write the broader note for this practice day. Tune-specific notes live
          under the tune events below.
        </p>

        <DailyReflectionForm
          practiceDate={data.selectedDate}
          redirectTo={redirectTo}
          initialValue={data.practiceDay?.daily_reflection ?? ""}
        />
      </section>

      <PracticeEventList
        events={data.events}
        categories={data.categories}
        practiceDate={data.selectedDate}
        redirectTo={redirectTo}
      />

      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          General notes
        </h2>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Add a note for the day that is not attached to one specific reviewed
          tune.
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
          placeholder="What else do you want to remember about today?"
        />
      </section>

      <PracticeCategoryManager
        categories={data.categories}
        redirectTo={redirectTo}
      />
    </div>
  )
}