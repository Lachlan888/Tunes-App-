"use client"

import { useState } from "react"
import Link from "next/link"
import type {
  PracticeDiaryMonthTuneSummary,
  PracticeDiaryWeekTuneSummary,
} from "@/lib/loaders/practice-diary"

type PracticeTuneSummary =
  | PracticeDiaryWeekTuneSummary
  | PracticeDiaryMonthTuneSummary

type PracticeTuneSummaryListProps = {
  summaries: PracticeTuneSummary[]
  emptyMessage: string
  sortMode: "recent" | "mostPractised"
}

type PracticeTuneSummaryCardProps = {
  summary: PracticeTuneSummary
}

const INITIAL_VISIBLE_TUNES = 5
const NOTE_PREVIEW_CHARACTER_LIMIT = 180

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

function getSortedSummaries({
  summaries,
  sortMode,
}: {
  summaries: PracticeTuneSummary[]
  sortMode: PracticeTuneSummaryListProps["sortMode"]
}) {
  const copiedSummaries = [...summaries]

  if (sortMode === "mostPractised") {
    return copiedSummaries.sort(
      (a, b) =>
        b.eventCount - a.eventCount ||
        b.noteCount - a.noteCount ||
        b.latestEventAt.localeCompare(a.latestEventAt)
    )
  }

  return copiedSummaries.sort((a, b) =>
    b.latestEventAt.localeCompare(a.latestEventAt)
  )
}

function PracticeTuneSummaryCard({ summary }: PracticeTuneSummaryCardProps) {
  const [isNoteExpanded, setIsNoteExpanded] = useState(false)
  const shouldClampNote =
    Boolean(summary.latestNoteSnippet) &&
    summary.latestNoteSnippet!.length > NOTE_PREVIEW_CHARACTER_LIMIT

  const visibleNote =
    summary.latestNoteSnippet && shouldClampNote && !isNoteExpanded
      ? `${summary.latestNoteSnippet
          .slice(0, NOTE_PREVIEW_CHARACTER_LIMIT)
          .trim()}...`
      : summary.latestNoteSnippet

  return (
    <article className="rounded-2xl border border-border bg-background/70 p-4 shadow-sm">
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
            {summary.eventCount}{" "}
            {pluralise(summary.eventCount, "session", "sessions")}
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
        <span>
          {summary.noteCount} {pluralise(summary.noteCount, "note", "notes")}
        </span>
        <span aria-hidden="true">|</span>
        <span>latest {formatDateOnly(summary.latestEventAt.slice(0, 10))}</span>
      </div>

      {visibleNote ? (
        <div className="mt-3 rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Latest note
          </p>

          <p className="mt-2 text-sm leading-6 text-foreground">
            {visibleNote}
          </p>

          {shouldClampNote ? (
            <button
              type="button"
              className="mt-2 text-xs font-medium text-muted-foreground transition hover:text-primary hover:underline"
              onClick={() => setIsNoteExpanded((current) => !current)}
            >
              {isNoteExpanded ? "Read less" : "Read more"}
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}

export default function PracticeTuneSummaryList({
  summaries,
  emptyMessage,
  sortMode,
}: PracticeTuneSummaryListProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (summaries.length === 0) {
    return (
      <p className="mt-5 rounded-2xl border border-border bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
        {emptyMessage}
      </p>
    )
  }

  const sortedSummaries = getSortedSummaries({ summaries, sortMode })
  const visibleSummaries = isExpanded
    ? sortedSummaries
    : sortedSummaries.slice(0, INITIAL_VISIBLE_TUNES)
  const hiddenCount = Math.max(
    sortedSummaries.length - visibleSummaries.length,
    0
  )

  return (
    <div className="mt-5 space-y-3">
      {visibleSummaries.map((summary) => (
        <PracticeTuneSummaryCard key={summary.piece.id} summary={summary} />
      ))}

      {hiddenCount > 0 ? (
        <button
          type="button"
          className="text-sm font-medium text-muted-foreground transition hover:text-primary hover:underline"
          onClick={() => setIsExpanded(true)}
        >
          Show {hiddenCount} more
        </button>
      ) : isExpanded && sortedSummaries.length > INITIAL_VISIBLE_TUNES ? (
        <button
          type="button"
          className="text-sm font-medium text-muted-foreground transition hover:text-primary hover:underline"
          onClick={() => setIsExpanded(false)}
        >
          Show less
        </button>
      ) : null}
    </div>
  )
}