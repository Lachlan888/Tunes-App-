import Link from "next/link"
import type { PracticeDiaryFocusSummary } from "@/lib/loaders/practice-diary"

type PracticeFocusSummaryListProps = {
  summaries: PracticeDiaryFocusSummary[]
  emptyMessage: string
}

function formatDateOnly(dateOnly: string) {
  const [year, month, day] = dateOnly.split("-")

  if (!year || !month || !day) {
    return dateOnly
  }

  return `${day}/${month}/${year}`
}

function pluralise(count: number, singular: string, plural: string) {
  return count === 1 ? singular : plural
}

function PracticeFocusSummaryRow({
  summary,
}: {
  summary: PracticeDiaryFocusSummary
}) {
  const latestNote = summary.notes[0] ?? null

  return (
    <li className="border-b border-border py-4 last:border-b-0">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/review/foci/${summary.focusId}`}
            className="break-words font-medium text-foreground underline-offset-4 transition hover:text-primary hover:underline"
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

          {latestNote ? (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {latestNote.tuneTitle ? `${latestNote.tuneTitle}: ` : ""}
              {latestNote.body}
            </p>
          ) : null}
        </div>

        <Link
          href={`/review/foci/${summary.focusId}`}
          className="shrink-0 rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:border-primary hover:bg-card hover:text-foreground"
        >
          Open
        </Link>
      </div>
    </li>
  )
}

export default function PracticeFocusSummaryList({
  summaries,
  emptyMessage,
}: PracticeFocusSummaryListProps) {
  if (summaries.length === 0) {
    return (
      <p className="mt-5 rounded-2xl border border-border bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
        {emptyMessage}
      </p>
    )
  }

  return (
    <ul className="mt-5 rounded-2xl border border-border bg-background/70 px-4">
      {summaries.map((summary) => (
        <PracticeFocusSummaryRow key={summary.focusId} summary={summary} />
      ))}
    </ul>
  )
}