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
  PracticeDiaryWeekCategorySummary,
  PracticeDiaryWeekData,
} from "@/lib/loaders/practice-diary"

type PracticeWeekViewProps = {
  data: PracticeDiaryWeekData
}

type MobileWeekPanel = "week" | "foci" | "categories"

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

function getCompactActivityText(
  day: PracticeDiaryWeekData["daySummaries"][number]
) {
  const activityLines = getActivityLines(day)

  if (activityLines.length === 0) {
    return "No practice logged"
  }

  return activityLines.join(" · ")
}

function getDueTuneCountLabel(count: number) {
  if (count === 0) return null

  return `${count} due ${count === 1 ? "tune" : "tunes"}`
}

function getDueTuneTitle(
  dueTune: PracticeDiaryWeekData["dueTunes"][number]
) {
  return dueTune.piece?.title ?? "Unknown tune"
}

function formatFocusDate(dateOnly: string) {
  return formatDateOnly(dateOnly)
}

function pluralise(count: number, singular: string, plural: string) {
  return count === 1 ? singular : plural
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

function WeekNavLinks({ data }: { data: PracticeDiaryWeekData }) {
  return (
    <div className="grid grid-cols-3 gap-2 md:flex md:flex-wrap">
      <Link
        href={`/review/diary?view=week&date=${data.previousWeekDate}`}
        className="rounded-full border border-border bg-background/70 px-3 py-2 text-center text-xs font-medium text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] md:px-4 md:text-sm"
      >
        Previous
      </Link>

      <Link
        href={`/review/diary?view=week&date=${data.currentWeekDate}`}
        className="rounded-full border border-border bg-background/70 px-3 py-2 text-center text-xs font-medium text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] md:px-4 md:text-sm"
      >
        Current
      </Link>

      <Link
        href={`/review/diary?view=week&date=${data.nextWeekDate}`}
        className="rounded-full border border-border bg-background/70 px-3 py-2 text-center text-xs font-medium text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] md:px-4 md:text-sm"
      >
        Next
      </Link>
    </div>
  )
}

function MobileWeekHeader({
  data,
  activePanel,
  onChangePanel,
}: {
  data: PracticeDiaryWeekData
  activePanel: MobileWeekPanel
  onChangePanel: (panel: MobileWeekPanel) => void
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:hidden">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Week
      </p>

      <h2 className="mt-2 font-serif text-2xl font-bold leading-tight text-foreground">
        {formatShortDate(data.weekStartDate)} to{" "}
        {formatShortDate(data.weekEndDate)}
      </h2>

      <div className="mt-4">
        <WeekNavLinks data={data} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-1 rounded-2xl border border-border bg-background/70 p-1">
        <button
          type="button"
          onClick={() => onChangePanel("week")}
          className={joinClasses(
            "rounded-xl px-2 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]",
            activePanel === "week"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          Week
        </button>

        <button
          type="button"
          onClick={() => onChangePanel("foci")}
          className={joinClasses(
            "rounded-xl px-2 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]",
            activePanel === "foci"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          Foci
        </button>

        <button
          type="button"
          onClick={() => onChangePanel("categories")}
          className={joinClasses(
            "rounded-xl px-2 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]",
            activePanel === "categories"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          Notes
        </button>
      </div>
    </section>
  )
}

function MobileDayRow({
  day,
  index,
  dueTunesForDay,
}: {
  day: PracticeDiaryWeekData["daySummaries"][number]
  index: number
  dueTunesForDay: PracticeDiaryWeekData["dueTunes"]
}) {
  const dueLabel = getDueTuneCountLabel(dueTunesForDay.length)
  const hasActivity = day.hasPractice || dueTunesForDay.length > 0

  return (
    <Link
      href={`/review/diary?view=day&date=${day.date}`}
      className={joinClasses(
        "block rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] md:hidden",
        hasActivity
          ? "border-primary bg-background/90"
          : "border-border bg-background/50"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {getDayLabel(index)}
            </p>

            <p className="text-sm font-semibold text-foreground">
              {formatShortDate(day.date)}
            </p>

            {day.isToday ? (
              <span className="rounded-full border border-accent bg-accent/30 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-accent-foreground">
                Today
              </span>
            ) : null}
          </div>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {getCompactActivityText(day)}
          </p>

          {dueLabel ? (
            <p className="mt-2 text-sm font-medium text-foreground">
              {dueLabel}
            </p>
          ) : null}

          {dueTunesForDay.length > 0 ? (
            <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
              {dueTunesForDay
                .slice(0, 2)
                .map((dueTune) => getDueTuneTitle(dueTune))
                .join(", ")}
              {dueTunesForDay.length > 2
                ? ` + ${dueTunesForDay.length - 2} more`
                : ""}
            </p>
          ) : null}
        </div>

        <span
          aria-hidden="true"
          className="shrink-0 text-lg text-muted-foreground"
        >
          →
        </span>
      </div>
    </Link>
  )
}

function MobileWeekAtAGlance({ data }: { data: PracticeDiaryWeekData }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:hidden">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Week at a glance
      </h2>

      <div className="mt-4 space-y-2">
        {data.daySummaries.map((day, index) => {
          const dueTunesForDay = data.dueTunes.filter(
            (dueTune) => dueTune.dueDate === day.date
          )

          return (
            <MobileDayRow
              key={day.date}
              day={day}
              index={index}
              dueTunesForDay={dueTunesForDay}
            />
          )
        })}
      </div>
    </section>
  )
}

function MobileFocusPatterns({
  summaries,
}: {
  summaries: PracticeDiaryFocusSummary[]
}) {
  const visibleSummaries = [...summaries]
    .sort((a, b) => b.noteCount - a.noteCount)
    .slice(0, 8)

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:hidden">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Foci touched
      </h2>

      {visibleSummaries.length === 0 ? (
        <p className="mt-4 rounded-xl border border-border bg-background/70 p-3 text-sm leading-6 text-muted-foreground">
          No focus-linked notes this week.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {visibleSummaries.map((summary) => {
            const latestNote = summary.notes[0] ?? null

            return (
              <Link
                key={summary.focusId}
                href={`/review/foci/${summary.focusId}`}
                className="block rounded-2xl border border-border bg-background/70 p-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-words text-lg font-semibold leading-tight text-foreground underline decoration-border decoration-2 underline-offset-4 transition hover:text-primary hover:decoration-primary">
                      {summary.focusTitle}
                    </p>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {summary.noteCount}{" "}
                      {pluralise(summary.noteCount, "note", "notes")} ·{" "}
                      {summary.tuneCount}{" "}
                      {pluralise(summary.tuneCount, "tune", "tunes")} · latest{" "}
                      {formatFocusDate(summary.latestDate)}
                    </p>
                  </div>

                  <span
                    aria-hidden="true"
                    className="shrink-0 text-lg text-muted-foreground"
                  >
                    →
                  </span>
                </div>

                {latestNote ? (
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                    {latestNote.tuneTitle ? `${latestNote.tuneTitle}: ` : ""}
                    {latestNote.body}
                  </p>
                ) : null}
              </Link>
            )
          })}
        </div>
      )}

      {summaries.length > visibleSummaries.length ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Showing {visibleSummaries.length} of {summaries.length} foci.
        </p>
      ) : null}
    </section>
  )
}

function MobileCategoryPatterns({
  summaries,
}: {
  summaries: PracticeDiaryWeekCategorySummary[]
}) {
  const visibleSummaries = [...summaries]
    .sort((a, b) => b.noteCount - a.noteCount)
    .slice(0, 8)

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:hidden">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Note categories
      </h2>

      {visibleSummaries.length === 0 ? (
        <p className="mt-4 rounded-xl border border-border bg-background/70 p-3 text-sm leading-6 text-muted-foreground">
          No categorised notes this week.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {visibleSummaries.map((summary) => (
            <Link
              key={summary.categoryId}
              href={`/review/diary/categories/${summary.categoryId}`}
              className="block rounded-2xl border border-border bg-background/70 p-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-words text-lg font-semibold leading-tight text-foreground underline decoration-border decoration-2 underline-offset-4 transition hover:text-primary hover:decoration-primary">
                    {summary.categoryName}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {summary.noteCount}{" "}
                    {pluralise(summary.noteCount, "note", "notes")}
                  </p>
                </div>

                <span
                  aria-hidden="true"
                  className="shrink-0 text-lg text-muted-foreground"
                >
                  →
                </span>
              </div>

              {summary.notes[0] ? (
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {summary.notes[0].tuneTitle
                    ? `${summary.notes[0].tuneTitle}: `
                    : ""}
                  {summary.notes[0].body}
                </p>
              ) : null}
            </Link>
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

function MobileWeekView({ data }: { data: PracticeDiaryWeekData }) {
  const [activePanel, setActivePanel] = useState<MobileWeekPanel>("week")

  return (
    <div className="space-y-4 md:hidden">
      <MobileWeekHeader
        data={data}
        activePanel={activePanel}
        onChangePanel={setActivePanel}
      />

      {activePanel === "week" ? (
        <MobileWeekAtAGlance data={data} />
      ) : activePanel === "foci" ? (
        <MobileFocusPatterns summaries={data.focusSummaries} />
      ) : (
        <MobileCategoryPatterns summaries={data.categorySummaries} />
      )}
    </div>
  )
}

function DesktopWeekSummary({ data }: { data: PracticeDiaryWeekData }) {
  return (
    <section className="hidden rounded-3xl border border-border bg-card p-6 shadow-sm md:block">
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
            A read-only pattern view of what happened across the selected week.
            Use Day view to write session summaries and tune notes.
          </p>
        </div>

        <WeekNavLinks data={data} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-8">
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
          label="Note categories"
          value={data.summary.categoriesUsed}
          helper="Used this week"
        />

        <SummaryCard
          label="Foci touched"
          value={data.summary.fociTouched}
          helper="Linked this week"
        />
      </div>
    </section>
  )
}

function DesktopWeekAtAGlance({ data }: { data: PracticeDiaryWeekData }) {
  return (
    <section className="hidden rounded-3xl border border-border bg-card p-6 shadow-sm md:block">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Week at a glance
      </h2>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Click any day to open the detailed day view. Due tunes appear on the day
        they are currently scheduled.
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
  )
}

export default function PracticeWeekView({ data }: PracticeWeekViewProps) {
  return (
    <div className="space-y-4 md:space-y-6">
      <MobileWeekView data={data} />

      <DesktopWeekSummary data={data} />
      <DesktopWeekAtAGlance data={data} />

      <section className="hidden gap-6 md:grid xl:grid-cols-[1.2fr_0.8fr_0.8fr]">
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
            Foci touched
          </h2>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Active practice intentions that received focus-linked notes this
            week.
          </p>

          <PracticeFocusSummaryList
            summaries={data.focusSummaries}
            emptyMessage="No focus-linked notes this week."
          />
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Note categories
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