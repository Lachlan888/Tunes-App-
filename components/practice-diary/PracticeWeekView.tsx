import Link from "next/link"
import PracticeCategorySummaryList from "@/components/practice-diary/PracticeCategorySummaryList"
import PracticeDueTuneMiniList from "@/components/practice-diary/PracticeDueTuneMiniList"
import PracticeTuneSummaryList from "@/components/practice-diary/PracticeTuneSummaryList"
import type { PracticeDiaryWeekData } from "@/lib/loaders/practice-diary"

type PracticeWeekViewProps = {
  data: PracticeDiaryWeekData
}

function formatDateOnly(dateOnly: string) {
  const [year, month, day] = dateOnly.split("-")

  if (!year || !month || !day) {
    return dateOnly
  }

  return `${day}/${month}/${year}`
}

function formatShortDate(dateOnly: string) {
  const [year, month, day] = dateOnly.split("-")

  if (!year || !month || !day) {
    return dateOnly
  }

  return `${day}/${month}`
}

function getDayLabel(index: number) {
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index] ?? ""
}

function getActivityLines(day: PracticeDiaryWeekData["daySummaries"][number]) {
  const lines: string[] = []

  if (day.formalReviewCount > 0) {
    lines.push(
      `${day.formalReviewCount} ${
        day.formalReviewCount === 1 ? "review" : "reviews"
      }`
    )
  }

  if (day.practiceCheckCount > 0) {
    lines.push(
      `${day.practiceCheckCount} practice ${
        day.practiceCheckCount === 1 ? "check" : "checks"
      }`
    )
  }

  if (day.noteCount > 0) {
    lines.push(`${day.noteCount} ${day.noteCount === 1 ? "note" : "notes"}`)
  }

  return lines
}

function DayActivitySummary({
  day,
}: {
  day: PracticeDiaryWeekData["daySummaries"][number]
}) {
  const activityLines = getActivityLines(day)

  if (activityLines.length === 0) {
    return (
      <p className="mt-3 text-sm italic leading-6 text-muted-foreground">
        No practice logged
      </p>
    )
  }

  return (
    <div className="mt-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        Activity
      </p>

      <ul className="mt-2 space-y-1 text-sm leading-6 text-muted-foreground">
        {activityLines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      {day.uniqueTuneCount === 0 && day.noteCount > 0 ? (
        <p className="mt-1 text-xs italic text-muted-foreground">
          No tune practice logged
        </p>
      ) : null}
    </div>
  )
}

function SummaryCard({
  label,
  value,
  helper,
}: {
  label: string
  value: number
  helper: string
}) {
  return (
    <article className="rounded-2xl border border-border bg-background/70 p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>

      <p className="mt-2 font-serif text-4xl font-bold text-foreground">
        {value}
      </p>

      <p className="mt-1 text-sm leading-6 text-muted-foreground">{helper}</p>
    </article>
  )
}

export default function PracticeWeekView({ data }: PracticeWeekViewProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Week summary
            </h2>

            <p className="mt-3 font-serif text-3xl font-bold text-foreground">
              {formatDateOnly(data.weekStartDate)} to{" "}
              {formatDateOnly(data.weekEndDate)}
            </p>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              A read-only pattern view of what happened across the selected
              week. Use Day view to write session summaries and tune notes.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/review/diary?view=week&date=${data.previousWeekDate}`}
              className="rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-muted hover:text-foreground"
            >
              Previous week
            </Link>

            <Link
              href={`/review/diary?view=week&date=${data.currentWeekDate}`}
              className="rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-muted hover:text-foreground"
            >
              Current week
            </Link>

            <Link
              href={`/review/diary?view=week&date=${data.nextWeekDate}`}
              className="rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-muted hover:text-foreground"
            >
              Next week
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-7">
          <SummaryCard
            label="Active days"
            value={data.summary.activeDays}
            helper="Days with practice activity"
          />

          <SummaryCard
            label="Due tunes"
            value={data.summary.dueTunes}
            helper="Scheduled this week"
          />

          <SummaryCard
            label="Reviews"
            value={data.summary.formalReviews}
            helper="Formal review events"
          />

          <SummaryCard
            label="Practice checks"
            value={data.summary.practiceChecks}
            helper="Diary-only checks"
          />

          <SummaryCard
            label="Tune notes"
            value={data.summary.tuneNotes}
            helper="Tune-linked notes"
          />

          <SummaryCard
            label="Tunes touched"
            value={data.summary.uniqueTunesTouched}
            helper="Unique tunes"
          />

          <SummaryCard
            label="Categories"
            value={data.summary.categoriesUsed}
            helper="Used this week"
          />
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Week at a glance
        </h2>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Click any day to open the detailed day view. Due tunes appear on the
          day they are currently scheduled.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-7">
          {data.daySummaries.map((day, index) => {
            const dueTunesForDay = data.dueTunes.filter(
              (dueTune) => dueTune.dueDate === day.date
            )

            return (
              <article
                key={day.date}
                className={`rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                  day.hasPractice || day.dueCount > 0
                    ? "border-primary bg-background/90"
                    : "border-border bg-background/50"
                }`}
              >
                <Link
                  href={`/review/diary?view=day&date=${day.date}`}
                  className="block"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {getDayLabel(index)}
                  </p>

                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {formatShortDate(day.date)}
                  </p>

                  {day.isToday ? (
                    <p className="mt-2 rounded-full border border-accent bg-accent/30 px-2 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-accent-foreground">
                      Today
                    </p>
                  ) : null}

                  <DayActivitySummary day={day} />
                </Link>

                <PracticeDueTuneMiniList
                  dueTunes={dueTunesForDay}
                  initialVisibleCount={3}
                />
              </article>
            )
          })}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Tunes touched this week
          </h2>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Tunes with logged practice activity this week.
          </p>

          <PracticeTuneSummaryList
            summaries={data.tuneSummaries}
            emptyMessage="No tune practice has been logged in this week yet."
            sortMode="recent"
          />
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Category patterns
          </h2>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            The practice lenses that showed up in notes this week.
          </p>

          <PracticeCategorySummaryList
            summaries={data.categorySummaries}
            emptyMessage="No categorised notes this week."
          />
        </section>
      </section>
    </div>
  )
}