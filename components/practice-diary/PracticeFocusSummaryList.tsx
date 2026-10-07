import Link from "next/link"
import { formatPracticeDate } from "@/lib/review"
import type { PracticeDiaryFocusSummary } from "@/lib/loaders/practice-diary"

type PracticeFocusSummaryListProps = {
  summaries: PracticeDiaryFocusSummary[]
  emptyMessage: string
}

function formatDateOnly(dateOnly: string) {
  return formatPracticeDate(dateOnly) ?? dateOnly
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
      <Link
        href={`/review/foci/${summary.focusId}`}
        className="group block transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 md:-mx-2 md:p-2 md:hover:bg-surface-note"
      >
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="break-words font-medium text-foreground underline decoration-border decoration-2 underline-offset-4 transition group-hover:text-primary group-hover:decoration-primary">
              {summary.focusTitle}
            </p>

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

          <span
            aria-hidden="true"
            className="inline-flex min-h-11 shrink-0 items-center text-xs font-semibold text-muted-foreground transition group-hover:text-primary"
          >
            Open
          </span>
        </div>
      </Link>
    </li>
  )
}

export default function PracticeFocusSummaryList({
  summaries,
  emptyMessage,
}: PracticeFocusSummaryListProps) {
  if (summaries.length === 0) {
    return (
      <p className="mt-5 border-b border-hairline bg-surface-note p-4 text-sm leading-6 text-muted-foreground">
        {emptyMessage}
      </p>
    )
  }

  return (
    <ul className="mt-5 border-t border-hairline px-1">
      {summaries.map((summary) => (
        <PracticeFocusSummaryRow key={summary.focusId} summary={summary} />
      ))}
    </ul>
  )
}
