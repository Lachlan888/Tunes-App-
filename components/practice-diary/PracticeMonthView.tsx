"use client"

import { useState } from "react"
import Link from "next/link"
import PracticeCategorySummaryList from "@/components/practice-diary/PracticeCategorySummaryList"
import PracticeDueTuneMiniList from "@/components/practice-diary/PracticeDueTuneMiniList"
import PracticeFocusSummaryList from "@/components/practice-diary/PracticeFocusSummaryList"
import PracticeTuneSummaryList from "@/components/practice-diary/PracticeTuneSummaryList"
import { joinClasses } from "@/components/ui/buttonStyles"
import type {
  PracticeDiaryFocusSummary,
  PracticeDiaryMonthData,
  PracticeDiaryWeekCategorySummary,
} from "@/lib/loaders/practice-diary"

type PracticeMonthViewProps = {
  data: PracticeDiaryMonthData
}

type MobileMonthPanel = "month" | "tunes" | "foci" | "categories"

function formatMonthLabel(dateOnly: string) {
  const [year, month] = dateOnly.split("-").map(Number)
  const date = new Date(Date.UTC(year, month - 1, 1))

  return new Intl.DateTimeFormat("en-AU", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}

function formatDateOnly(dateOnly: string) {
  const [year, month, day] = dateOnly.split("-")

  if (!year || !month || !day) {
    return dateOnly
  }

  return `${day}/${month}/${year}`
}

function getDayNumber(dateOnly: string) {
  const day = dateOnly.split("-")[2]
  return day ? String(Number(day)) : dateOnly
}

function pluralise(count: number, singular: string, plural: string) {
  return count === 1 ? singular : plural
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

function getMobileActivityClass(
  activityLevel: string,
  isInSelectedMonth: boolean
) {
  if (!isInSelectedMonth) {
    return "border-border bg-background/30 text-muted-foreground opacity-45"
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

function getCompactActivityText(
  day: PracticeDiaryMonthData["daySummaries"][number]
) {
  const activityLines = getActivityLines(day)

  if (activityLines.length === 0) {
    return "No practice logged"
  }

  return activityLines.join(" · ")
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

function MonthNavLinks({ data }: { data: PracticeDiaryMonthData }) {
  return (
    <div className="grid grid-cols-3 gap-2 md:flex md:flex-wrap">
      <Link
        href={`/review/diary?view=month&date=${data.previousMonthDate}`}
        className="rounded-full border border-border bg-background/70 px-3 py-2 text-center text-xs font-medium text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] md:px-4 md:text-sm"
      >
        Previous
      </Link>

      <Link
        href={`/review/diary?view=month&date=${data.currentMonthDate}`}
        className="rounded-full border border-border bg-background/70 px-3 py-2 text-center text-xs font-medium text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] md:px-4 md:text-sm"
      >
        Current
      </Link>

      <Link
        href={`/review/diary?view=month&date=${data.nextMonthDate}`}
        className="rounded-full border border-border bg-background/70 px-3 py-2 text-center text-xs font-medium text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] md:px-4 md:text-sm"
      >
        Next
      </Link>
    </div>
  )
}

function MobileMonthHeader({
  data,
  activePanel,
  onChangePanel,
}: {
  data: PracticeDiaryMonthData
  activePanel: MobileMonthPanel
  onChangePanel: (panel: MobileMonthPanel) => void
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:hidden">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Month
      </p>

      <h2 className="mt-2 font-serif text-2xl font-bold leading-tight text-foreground">
        {formatMonthLabel(data.monthStartDate)}
      </h2>

      <div className="mt-4">
        <MonthNavLinks data={data} />
      </div>

      <div className="mt-4 grid grid-cols-4 gap-1 rounded-2xl border border-border bg-background/70 p-1">
        {[
          ["month", "Month"],
          ["tunes", "Tunes"],
          ["foci", "Foci"],
          ["categories", "Notes"],
        ].map(([panel, label]) => (
          <button
            key={panel}
            type="button"
            onClick={() => onChangePanel(panel as MobileMonthPanel)}
            className={joinClasses(
              "rounded-xl px-1 py-2 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]",
              activePanel === panel
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  )
}

function MobileMonthCalendar({ data }: { data: PracticeDiaryMonthData }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:hidden">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Month summary
      </h2>

      <div className="mt-4 grid grid-cols-7 gap-1">
        {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
          <p
            key={`${day}-${index}`}
            className="py-1 text-center text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
          >
            {day}
          </p>
        ))}

        {data.daySummaries.map((day) => {
          const dueTunesForDay = data.dueTunes.filter(
            (dueTune) => dueTune.dueDate === day.date
          )

          return (
            <Link
              key={day.date}
              href={`/review/diary?view=day&date=${day.date}`}
              aria-label={`${getDayNumber(day.date)} ${getCompactActivityText(
                day
              )}`}
              className={joinClasses(
                "relative flex aspect-square min-w-0 items-center justify-center rounded-xl border text-xs font-semibold transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]",
                getMobileActivityClass(day.activityLevel, day.isInSelectedMonth),
                day.isToday ? "ring-2 ring-[var(--focus-ring)]" : ""
              )}
            >
              <span>{getDayNumber(day.date)}</span>

              {dueTunesForDay.length > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[0.55rem] font-bold leading-4 text-destructive-foreground">
                  {dueTunesForDay.length > 9 ? "9+" : dueTunesForDay.length}
                </span>
              ) : null}
            </Link>
          )
        })}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
        <div className="rounded-xl border border-border bg-background/70 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em]">
            Active days
          </p>
          <p className="mt-1 font-serif text-2xl font-bold text-foreground">
            {data.summary.activeDays}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-background/70 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em]">
            Foci touched
          </p>
          <p className="mt-1 font-serif text-2xl font-bold text-foreground">
            {data.summary.fociTouched}
          </p>
        </div>
      </div>
    </section>
  )
}

function MobileMostPractisedTunes({ data }: { data: PracticeDiaryMonthData }) {
  const visibleSummaries = [...data.tuneSummaries]
    .sort(
      (a, b) =>
        b.eventCount - a.eventCount ||
        b.noteCount - a.noteCount ||
        b.latestEventAt.localeCompare(a.latestEventAt)
    )
    .slice(0, 10)

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:hidden">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Most practised tunes
      </h2>

      {visibleSummaries.length === 0 ? (
        <p className="mt-4 rounded-xl border border-border bg-background/70 p-3 text-sm leading-6 text-muted-foreground">
          No tune practice has been logged in this month yet.
        </p>
      ) : (
        <div className="mt-4 space-y-2">
          {visibleSummaries.map((summary, index) => (
            <Link
              key={summary.piece.id}
              href={`/library/${summary.piece.id}`}
              className="block rounded-xl border border-border bg-background/70 p-3 transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold text-muted-foreground">
                  {index + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {summary.piece.title}
                    </p>

                    <span className="shrink-0 text-sm text-muted-foreground">
                      →
                    </span>
                  </div>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {summary.eventCount}{" "}
                    {pluralise(summary.eventCount, "session", "sessions")}
                    {summary.noteCount > 0
                      ? ` · ${summary.noteCount} ${pluralise(
                          summary.noteCount,
                          "note",
                          "notes"
                        )}`
                      : ""}
                    {typeof summary.latestStage === "number"
                      ? ` · Stage ${summary.latestStage}`
                      : ""}
                  </p>

                  {summary.latestOutcome ? (
                    <p className="mt-1 text-xs font-medium text-muted-foreground">
                      Latest: {summary.latestOutcome}
                    </p>
                  ) : null}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {data.tuneSummaries.length > visibleSummaries.length ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Showing {visibleSummaries.length} of {data.tuneSummaries.length} tunes.
        </p>
      ) : null}
    </section>
  )
}

function MobileFocusDistribution({
  summaries,
}: {
  summaries: PracticeDiaryFocusSummary[]
}) {
  const visibleSummaries = [...summaries]
    .sort((a, b) => b.noteCount - a.noteCount)
    .slice(0, 10)

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:hidden">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Foci touched
      </h2>

      {visibleSummaries.length === 0 ? (
        <p className="mt-4 rounded-xl border border-border bg-background/70 p-3 text-sm leading-6 text-muted-foreground">
          No focus-linked notes this month.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {visibleSummaries.map((summary) => {
            const latestNote = summary.notes[0] ?? null

            return (
              <li key={summary.focusId} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/review/foci/${summary.focusId}`}
                      className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      {summary.focusTitle}
                    </Link>

                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                      {summary.noteCount}{" "}
                      {pluralise(summary.noteCount, "note", "notes")} ·{" "}
                      {summary.tuneCount}{" "}
                      {pluralise(summary.tuneCount, "tune", "tunes")} · latest{" "}
                      {formatDateOnly(summary.latestDate)}
                    </p>
                  </div>

                  <Link
                    href={`/review/foci/${summary.focusId}`}
                    className="shrink-0 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground"
                  >
                    Open
                  </Link>
                </div>

                {latestNote ? (
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                    {latestNote.tuneTitle ? `${latestNote.tuneTitle}: ` : ""}
                    {latestNote.body}
                  </p>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}

      {summaries.length > visibleSummaries.length ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Showing {visibleSummaries.length} of {summaries.length} foci.
        </p>
      ) : null}
    </section>
  )
}

function MobileCategoryDistribution({
  summaries,
}: {
  summaries: PracticeDiaryWeekCategorySummary[]
}) {
  const visibleSummaries = [...summaries]
    .sort((a, b) => b.noteCount - a.noteCount)
    .slice(0, 10)

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:hidden">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Note categories
      </h2>

      {visibleSummaries.length === 0 ? (
        <p className="mt-4 rounded-xl border border-border bg-background/70 p-3 text-sm leading-6 text-muted-foreground">
          No categorised notes this month.
        </p>
      ) : (
        <div className="mt-4 space-y-2">
          {visibleSummaries.map((summary) => (
            <div
              key={summary.categoryId}
              className="rounded-xl border border-border bg-background/70 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 text-sm font-semibold text-foreground">
                  {summary.categoryName}
                </p>

                <span className="shrink-0 rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                  {summary.noteCount}
                </span>
              </div>

              {summary.notes[0] ? (
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {summary.notes[0].tuneTitle
                    ? `${summary.notes[0].tuneTitle}: `
                    : ""}
                  {summary.notes[0].body}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {summaries.length > visibleSummaries.length ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Showing {visibleSummaries.length} of {summaries.length} note
          categories.
        </p>
      ) : null}
    </section>
  )
}

function MobileMonthView({ data }: { data: PracticeDiaryMonthData }) {
  const [activePanel, setActivePanel] = useState<MobileMonthPanel>("month")

  return (
    <div className="space-y-4 md:hidden">
      <MobileMonthHeader
        data={data}
        activePanel={activePanel}
        onChangePanel={setActivePanel}
      />

      {activePanel === "month" ? (
        <MobileMonthCalendar data={data} />
      ) : activePanel === "tunes" ? (
        <MobileMostPractisedTunes data={data} />
      ) : activePanel === "foci" ? (
        <MobileFocusDistribution summaries={data.focusSummaries} />
      ) : (
        <MobileCategoryDistribution summaries={data.categorySummaries} />
      )}
    </div>
  )
}

function DesktopMonthSummary({ data }: { data: PracticeDiaryMonthData }) {
  return (
    <section className="hidden rounded-3xl border border-border bg-card p-6 shadow-sm md:block">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Month summary
          </h2>

          <p className="mt-3 font-serif text-3xl font-bold text-foreground">
            {formatMonthLabel(data.monthStartDate)}
          </p>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            A read-only habit and coverage view for the selected month. Use Day
            view to write, and Week view to inspect shorter-term patterns.
          </p>
        </div>

        <MonthNavLinks data={data} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-8">
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
          label="Note categories"
          value={data.summary.categoriesUsed}
          helper="Used this month"
        />

        <SummaryCard
          label="Foci touched"
          value={data.summary.fociTouched}
          helper="Linked this month"
        />
      </div>
    </section>
  )
}

function DesktopMonthCalendar({ data }: { data: PracticeDiaryMonthData }) {
  return (
    <section className="hidden rounded-3xl border border-border bg-card p-6 shadow-sm md:block">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Month at a glance
      </h2>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Darker days have more logged practice activity. Due tunes are listed on
        the day they are currently scheduled.
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
  )
}

export default function PracticeMonthView({ data }: PracticeMonthViewProps) {
  return (
    <div className="space-y-4 md:space-y-6">
      <MobileMonthView data={data} />

      <DesktopMonthSummary data={data} />
      <DesktopMonthCalendar data={data} />

      <section className="hidden gap-6 md:grid xl:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Most practised tunes
          </h2>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Tunes with the most logged practice activity this month.
          </p>

          <PracticeTuneSummaryList
            summaries={data.tuneSummaries}
            emptyMessage="No tune practice has been logged in this month yet."
            sortMode="mostPractised"
          />
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Foci touched
          </h2>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Practice intentions that received focus-linked notes this month.
          </p>

          <PracticeFocusSummaryList
            summaries={data.focusSummaries}
            emptyMessage="No focus-linked notes this month."
          />
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Note categories
          </h2>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            The practice lenses that appeared in notes this month.
          </p>

          <PracticeCategorySummaryList
            summaries={data.categorySummaries}
            emptyMessage="No categorised notes this month."
          />
        </section>
      </section>
    </div>
  )
}