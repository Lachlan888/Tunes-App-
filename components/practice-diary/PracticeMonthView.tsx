import Link from "next/link"
import PracticeDueTuneMiniList from "@/components/practice-diary/PracticeDueTuneMiniList"
import type { PracticeDiaryMonthData } from "@/lib/loaders/practice-diary"

type PracticeMonthViewProps = {
  data: PracticeDiaryMonthData
}

function formatDateOnly(dateOnly: string) {
  const [year, month, day] = dateOnly.split("-")

  if (!year || !month || !day) {
    return dateOnly
  }

  return `${day}/${month}/${year}`
}

function formatMonthLabel(dateOnly: string) {
  const [year, month] = dateOnly.split("-").map(Number)
  const date = new Date(Date.UTC(year, month - 1, 1))

  return new Intl.DateTimeFormat("en-AU", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}

function getDayNumber(dateOnly: string) {
  const day = dateOnly.split("-")[2]
  return day ? String(Number(day)) : dateOnly
}

function getActivityClass(activityLevel: string, isInSelectedMonth: boolean) {
  if (!isInSelectedMonth) {
    return "border-border bg-background/30 text-muted-foreground opacity-50"
  }

  if (activityLevel === "heavy") {
    return "border-primary bg-primary text-primary-foreground"
  }

  if (activityLevel === "medium") {
    return "border-primary bg-accent/60 text-accent-foreground"
  }

  if (activityLevel === "light") {
    return "border-border bg-background/90 text-foreground"
  }

  return "border-border bg-background/50 text-muted-foreground"
}

function getActivityLines(day: PracticeDiaryMonthData["daySummaries"][number]) {
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
  day: PracticeDiaryMonthData["daySummaries"][number]
}) {
  const activityLines = getActivityLines(day)

  if (activityLines.length === 0) {
    return (
      <p className="mt-3 text-xs italic leading-5 opacity-80">
        No practice logged
      </p>
    )
  }

  return (
    <div className="mt-3">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] opacity-80">
        Activity
      </p>

      <ul className="mt-1 space-y-1 text-xs leading-5">
        {activityLines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      {day.uniqueTuneCount === 0 && day.noteCount > 0 ? (
        <p className="mt-1 text-[0.7rem] italic opacity-80">
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

export default function PracticeMonthView({ data }: PracticeMonthViewProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Month summary
            </h2>

            <p className="mt-3 font-serif text-3xl font-bold text-foreground">
              {formatMonthLabel(data.monthStartDate)}
            </p>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              A read-only habit and coverage view for the selected month. Use
              Day view to write, and Week view to inspect shorter-term patterns.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/review/diary?view=month&date=${data.previousMonthDate}`}
              className="rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-muted hover:text-foreground"
            >
              Previous month
            </Link>

            <Link
              href={`/review/diary?view=month&date=${data.currentMonthDate}`}
              className="rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-muted hover:text-foreground"
            >
              Current month
            </Link>

            <Link
              href={`/review/diary?view=month&date=${data.nextMonthDate}`}
              className="rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-muted hover:text-foreground"
            >
              Next month
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-7">
          <SummaryCard
            label="Active days"
            value={data.summary.activeDays}
            helper="Days with practice"
          />

          <SummaryCard
            label="Due tunes"
            value={data.summary.dueTunes}
            helper="Scheduled this month"
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
            helper="Used this month"
          />
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Practice calendar
        </h2>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Darker days have more logged practice activity. Due tunes are listed
          on the day they are currently scheduled.
        </p>

        <div className="mt-5 grid grid-cols-7 gap-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <p
              key={day}
              className="px-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
            >
              {day}
            </p>
          ))}

          {data.daySummaries.map((day) => {
            const dueTunesForDay = data.dueTunes.filter(
              (dueTune) => dueTune.dueDate === day.date
            )

            return (
              <article
                key={day.date}
                className={`min-h-36 rounded-2xl border p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${getActivityClass(
                  day.activityLevel,
                  day.isInSelectedMonth
                )}`}
              >
                <Link
                  href={`/review/diary?view=day&date=${day.date}`}
                  className="block"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold">
                      {getDayNumber(day.date)}
                    </span>

                    {day.isToday ? (
                      <span className="rounded-full border border-border bg-background/70 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-foreground">
                        Today
                      </span>
                    ) : null}
                  </div>

                  <DayActivitySummary day={day} />
                </Link>

                <PracticeDueTuneMiniList
                  dueTunes={dueTunesForDay}
                  initialVisibleCount={2}
                />
              </article>
            )
          })}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Most practised tunes
          </h2>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Tunes with the most logged practice activity this month.
          </p>

          {data.tuneSummaries.length === 0 ? (
            <p className="mt-5 rounded-2xl border border-border bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
              No tune practice has been logged in this month yet.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {[...data.tuneSummaries]
                .sort(
                  (a, b) =>
                    b.eventCount - a.eventCount ||
                    b.noteCount - a.noteCount ||
                    b.latestEventAt.localeCompare(a.latestEventAt)
                )
                .slice(0, 10)
                .map((summary) => (
                  <article
                    key={summary.piece.id}
                    className="rounded-2xl border border-border bg-background/70 p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <Link
                          href={`/library/${summary.piece.id}`}
                          className="font-serif text-2xl font-bold text-foreground transition hover:text-primary"
                        >
                          {summary.piece.title}
                        </Link>

                        <p className="mt-2 text-sm text-muted-foreground">
                          {[
                            summary.piece.key,
                            summary.piece.style,
                            summary.piece.time_signature,
                          ]
                            .filter(Boolean)
                            .join(" · ") || "No metadata yet"}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          {summary.eventCount} events
                        </span>

                        {summary.latestOutcome ? (
                          <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                            {summary.latestOutcome}
                          </span>
                        ) : null}

                        {typeof summary.latestStage === "number" ? (
                          <span className="rounded-full border border-accent bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-accent-foreground">
                            Stage {summary.latestStage}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-3 text-sm leading-6 text-muted-foreground">
                      <span>{summary.noteCount} notes</span>
                      <span aria-hidden="true">|</span>
                      <span>
                        latest activity{" "}
                        {formatDateOnly(summary.latestEventAt.slice(0, 10))}
                      </span>
                    </div>

                    {summary.latestNoteSnippet ? (
                      <p className="mt-3 rounded-2xl border border-border bg-card p-4 text-sm leading-6 text-foreground">
                        {summary.latestNoteSnippet}
                      </p>
                    ) : null}
                  </article>
                ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Category distribution
          </h2>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            The practice lenses that appeared in notes this month.
          </p>

          {data.categorySummaries.length === 0 ? (
            <p className="mt-5 rounded-2xl border border-border bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
              No categorised notes this month.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {data.categorySummaries.map((summary) => (
                <article
                  key={summary.categoryId}
                  className="rounded-2xl border border-border bg-background/70 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold text-foreground">
                      {summary.categoryName}
                    </h3>

                    <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {summary.noteCount}
                    </span>
                  </div>

                  <div className="mt-3 space-y-3">
                    {summary.notes.map((note) => (
                      <div
                        key={note.noteId}
                        className="rounded-xl border border-border bg-card p-3"
                      >
                        {note.pieceId && note.tuneTitle ? (
                          <Link
                            href={`/library/${note.pieceId}`}
                            className="text-sm font-semibold text-foreground transition hover:text-primary"
                          >
                            {note.tuneTitle}
                          </Link>
                        ) : (
                          <p className="text-sm font-semibold text-muted-foreground">
                            General note
                          </p>
                        )}

                        <p className="mt-2 text-sm leading-6 text-foreground">
                          {note.body}
                        </p>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </div>
  )
}