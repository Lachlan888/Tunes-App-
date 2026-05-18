"use client"

import { useState } from "react"
import Link from "next/link"
import type { PracticeDiaryWeekCategorySummary } from "@/lib/loaders/practice-diary"

type PracticeCategorySummaryListProps = {
  summaries: PracticeDiaryWeekCategorySummary[]
  emptyMessage: string
}

type PracticeCategorySummaryCardProps = {
  summary: PracticeDiaryWeekCategorySummary
}

type PracticeCategoryNoteCardProps = {
  note: PracticeDiaryWeekCategorySummary["notes"][number]
}

const INITIAL_VISIBLE_NOTES = 3
const BODY_PREVIEW_CHARACTER_LIMIT = 180

function PracticeCategoryNoteCard({ note }: PracticeCategoryNoteCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const shouldClamp = note.body.length > BODY_PREVIEW_CHARACTER_LIMIT

  const visibleBody =
    shouldClamp && !isExpanded
      ? `${note.body.slice(0, BODY_PREVIEW_CHARACTER_LIMIT).trim()}...`
      : note.body

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      {note.pieceId && note.tuneTitle ? (
        <Link
          href={`/library/${note.pieceId}`}
          className="text-sm font-semibold text-foreground underline decoration-border decoration-2 underline-offset-4 transition hover:text-primary hover:decoration-primary"
        >
          {note.tuneTitle}
        </Link>
      ) : (
        <p className="text-sm font-semibold text-muted-foreground">
          General note
        </p>
      )}

      <p className="mt-2 text-sm leading-6 text-foreground">{visibleBody}</p>

      {shouldClamp ? (
        <button
          type="button"
          className="mt-2 text-xs font-medium text-muted-foreground transition hover:text-primary hover:underline"
          onClick={() => setIsExpanded((current) => !current)}
        >
          {isExpanded ? "Read less" : "Read more"}
        </button>
      ) : null}
    </div>
  )
}

function PracticeCategorySummaryCard({
  summary,
}: PracticeCategorySummaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const visibleNotes = isExpanded
    ? summary.notes
    : summary.notes.slice(0, INITIAL_VISIBLE_NOTES)
  const hiddenCount = Math.max(summary.notes.length - visibleNotes.length, 0)

  return (
    <article className="rounded-2xl border border-border bg-background/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/review/diary/categories/${summary.categoryId}`}
          className="min-w-0 text-sm font-semibold text-foreground underline decoration-border decoration-2 underline-offset-4 transition hover:text-primary hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {summary.categoryName}
        </Link>

        <Link
          href={`/review/diary/categories/${summary.categoryId}`}
          className="shrink-0 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground transition hover:border-primary hover:bg-card hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          aria-label={`Open ${summary.categoryName} category`}
        >
          {summary.noteCount}
        </Link>
      </div>

      <div className="mt-3 space-y-3">
        {visibleNotes.map((note) => (
          <PracticeCategoryNoteCard key={note.noteId} note={note} />
        ))}
      </div>

      {hiddenCount > 0 ? (
        <button
          type="button"
          className="mt-3 text-sm font-medium text-muted-foreground transition hover:text-primary hover:underline"
          onClick={() => setIsExpanded(true)}
        >
          Show {hiddenCount} more
        </button>
      ) : isExpanded && summary.notes.length > INITIAL_VISIBLE_NOTES ? (
        <button
          type="button"
          className="mt-3 text-sm font-medium text-muted-foreground transition hover:text-primary hover:underline"
          onClick={() => setIsExpanded(false)}
        >
          Show less
        </button>
      ) : null}
    </article>
  )
}

export default function PracticeCategorySummaryList({
  summaries,
  emptyMessage,
}: PracticeCategorySummaryListProps) {
  if (summaries.length === 0) {
    return (
      <p className="mt-5 rounded-2xl border border-border bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
        {emptyMessage}
      </p>
    )
  }

  return (
    <div className="mt-5 space-y-3">
      {summaries.map((summary) => (
        <PracticeCategorySummaryCard
          key={summary.categoryId}
          summary={summary}
        />
      ))}
    </div>
  )
}