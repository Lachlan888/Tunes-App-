"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import type { ReactNode } from "react"
import CardPager from "@/components/ui/CardPager"
import { joinClasses } from "@/components/ui/buttonStyles"
import type {
  PracticeIndexData,
  PracticeIndexFocusSummary,
  PracticeIndexItem,
} from "@/lib/loaders/practice-index"

type PracticeDiaryIndexProps = {
  data: PracticeIndexData
}

type PracticeIndexView = "foci" | "notes"

const views: {
  value: PracticeIndexView
  label: string
  heading: string
  searchLabel: string
  searchPlaceholder: string
}[] = [
  {
    value: "foci",
    label: "Focus areas",
    heading: "Focus areas",
    searchLabel: "Search focus areas",
    searchPlaceholder: "Search focus areas...",
  },
  {
    value: "notes",
    label: "Notes",
    heading: "Notes",
    searchLabel: "Search notes",
    searchPlaceholder: "Search notes...",
  },
]

function formatDateOnly(dateOnly: string | null) {
  if (!dateOnly) return "No notes yet"

  const [year, month, day] = dateOnly.split("-")

  if (!year || !month || !day) {
    return dateOnly
  }

  return `${day}/${month}/${year}`
}

function pluralise(count: number, singular: string, plural: string) {
  return count === 1 ? singular : plural
}

function normaliseSearch(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
}

function searchableIncludes(
  parts: Array<string | number | null | undefined>,
  query: string
) {
  if (!query) return true

  const haystack = normaliseSearch(
    parts
      .filter(
        (part): part is string | number => part !== null && part !== undefined
      )
      .join(" ")
  )

  return haystack.includes(query)
}

function getKindLabel(kind: PracticeIndexItem["kind"]) {
  if (kind === "daily_reflection") return "Daily reflection"
  if (kind === "review_note") return "Review note"
  if (kind === "tune_note") return "Tune note"

  return "General note"
}

function getKindTone(kind: PracticeIndexItem["kind"]) {
  if (kind === "daily_reflection") {
    return "border-primary bg-primary/10 text-foreground"
  }

  if (kind === "review_note") {
    return "border-accent bg-accent/30 text-accent-foreground"
  }

  if (kind === "tune_note") {
    return "border-success bg-success/15 text-foreground"
  }

  return "border-border bg-muted text-muted-foreground"
}

function getFocusStatusLabel(status: PracticeIndexFocusSummary["status"]) {
  if (status === "active") return "Active"
  if (status === "paused") return "Paused"
  if (status === "completed") return "Completed"

  return "Archived"
}

function getFocusStatusClasses(status: PracticeIndexFocusSummary["status"]) {
  if (status === "active") {
    return "border-success bg-success text-success-foreground"
  }

  if (status === "completed") {
    return "border-primary bg-primary text-primary-foreground"
  }

  return "border-border bg-muted text-muted-foreground"
}

function getAllNotes(data: PracticeIndexData) {
  const notesById = new Map<string, PracticeIndexItem>()

  for (const group of data.categoryGroups) {
    for (const note of group.notes) {
      notesById.set(note.id, note)
    }
  }

  return Array.from(notesById.values()).sort((a, b) => {
    const dateCompare = b.noteDate.localeCompare(a.noteDate)

    if (dateCompare !== 0) {
      return dateCompare
    }

    return b.createdAt.localeCompare(a.createdAt)
  })
}

function getNoteDayHref(note: PracticeIndexItem) {
  const anchor = note.rawNoteId ? `#note-${note.rawNoteId}` : ""
  return `/review/diary?view=day&date=${note.noteDate}${anchor}`
}

function PracticeIndexSwitcher({
  activeView,
  onViewChange,
}: {
  activeView: PracticeIndexView
  onViewChange: (view: PracticeIndexView) => void
}) {
  return (
    <div
      className="grid grid-cols-2 gap-2"
      role="tablist"
      aria-label="Practice index views"
    >
      {views.map((view) => {
        const isActive = activeView === view.value

        return (
          <button
            key={view.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onViewChange(view.value)}
            className={joinClasses(
              "min-h-11 rounded-full border px-3 py-2 text-center text-sm font-semibold leading-tight transition focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] md:px-4 md:text-base",
              isActive
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-background/70 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {view.label}
          </button>
        )
      })}
    </div>
  )
}

function PracticeIndexSearch({
  activeView,
  query,
  onQueryChange,
}: {
  activeView: PracticeIndexView
  query: string
  onQueryChange: (query: string) => void
}) {
  const currentView = views.find((view) => view.value === activeView) ?? views[0]

  return (
    <label className="grid gap-2 text-sm font-medium text-foreground">
      {currentView.searchLabel}
      <input
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={currentView.searchPlaceholder}
        className="min-h-11 w-full rounded-2xl border border-border bg-background/70 px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
      />
    </label>
  )
}

function PracticeFocusCard({ focus }: { focus: PracticeIndexFocusSummary }) {
  const latestNote = focus.recentNotes[0] ?? null

  return (
    <article className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/review/foci/${focus.id}`}
          className="break-words font-serif text-2xl font-bold leading-tight text-foreground underline decoration-border decoration-2 underline-offset-4 transition hover:text-primary hover:decoration-primary"
        >
          {focus.title}
        </Link>

        <span
          className={joinClasses(
            "rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em]",
            getFocusStatusClasses(focus.status)
          )}
        >
          {getFocusStatusLabel(focus.status)}
        </span>
      </div>

      {focus.description ? (
        <p className="text-sm leading-6 text-muted-foreground">
          {focus.description}
        </p>
      ) : null}

      <p className="text-sm leading-6 text-muted-foreground">
        {focus.tuneCount} {pluralise(focus.tuneCount, "tune", "tunes")} ·{" "}
        {focus.noteCount} {pluralise(focus.noteCount, "note", "notes")} · last
        touched {formatDateOnly(focus.lastTouchedDate)}
      </p>

      {focus.tuneTitles.length > 0 ? (
        <p className="text-sm leading-6 text-muted-foreground">
          <span className="font-medium text-foreground">Tunes: </span>
          {focus.tuneTitles.slice(0, 6).join(", ")}
          {focus.tuneTitles.length > 6
            ? ` +${focus.tuneTitles.length - 6} more`
            : ""}
        </p>
      ) : null}

      {latestNote ? (
        <p className="rounded-2xl border border-border bg-background/70 p-3 text-sm leading-6 text-muted-foreground">
          <span className="font-medium text-foreground">Latest note: </span>
          {latestNote.piece ? `${latestNote.piece.title}: ` : ""}
          {latestNote.body}
        </p>
      ) : null}

      <div>
        <Link
          href={`/review/foci/${focus.id}`}
          className="inline-flex rounded-full border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
        >
          Open focus
        </Link>
      </div>
    </article>
  )
}

function PracticeNoteCard({ note }: { note: PracticeIndexItem }) {
  return (
    <article className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        <span
          className={joinClasses(
            "rounded-full border px-2.5 py-1",
            getKindTone(note.kind)
          )}
        >
          {getKindLabel(note.kind)}
        </span>

        {note.categoryName ? (
          <span className="rounded-full border border-border bg-muted px-2.5 py-1">
            {note.categoryName}
          </span>
        ) : null}

        {note.focus ? (
          <Link
            href={`/review/foci/${note.focus.id}`}
            className="rounded-full border border-border bg-background/70 px-2.5 py-1 transition hover:border-primary hover:text-foreground"
          >
            Focus: {note.focus.title}
          </Link>
        ) : null}
      </div>

      {note.piece ? (
        <Link
          href={`/library/${note.piece.id}`}
          className="font-serif text-2xl font-bold leading-tight text-foreground underline decoration-border decoration-2 underline-offset-4 transition hover:text-primary hover:decoration-primary"
        >
          {note.piece.title}
        </Link>
      ) : (
        <h3 className="font-serif text-2xl font-bold leading-tight text-foreground">
          {getKindLabel(note.kind)}
        </h3>
      )}

      <p className="whitespace-pre-wrap text-lg leading-8 text-foreground md:text-base md:leading-7">
        {note.body}
      </p>

      <div className="flex flex-wrap gap-2">
        <Link
          href={getNoteDayHref(note)}
          className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
        >
          Open day
        </Link>

        {note.piece ? (
          <Link
            href={`/library/${note.piece.id}`}
            className="rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-semibold text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          >
            Open tune
          </Link>
        ) : null}

        {note.focus ? (
          <Link
            href={`/review/foci/${note.focus.id}`}
            className="rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-semibold text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          >
            Open focus
          </Link>
        ) : null}
      </div>

      <p className="text-sm font-medium text-muted-foreground">
        {formatDateOnly(note.noteDate)}
      </p>
    </article>
  )
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-2xl border border-border bg-card p-5 text-sm leading-6 text-muted-foreground shadow-sm md:bg-background/70 md:shadow-none">
      {children}
    </p>
  )
}

function FallbackMatches({
  activeView,
  query,
  foci,
  notes,
}: {
  activeView: PracticeIndexView
  query: string
  foci: PracticeIndexFocusSummary[]
  notes: PracticeIndexItem[]
}) {
  if (!query.trim()) return null

  const fallbackFoci = activeView === "foci" ? [] : foci.slice(0, 3)
  const fallbackNotes = activeView === "notes" ? [] : notes.slice(0, 3)
  const hasFallback = fallbackFoci.length > 0 || fallbackNotes.length > 0

  if (!hasFallback) return null

  return (
    <section className="grid gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm md:bg-background/70">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Found elsewhere
        </h3>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Nothing in the selected view matches “{query}”, but the search appears
          elsewhere in the practice index.
        </p>
      </div>

      {fallbackFoci.length > 0 ? (
        <section className="grid gap-2">
          <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Focus areas
          </h4>

          <ul className="rounded-2xl border border-border bg-card px-3 shadow-sm md:bg-background/70">
            {fallbackFoci.map((focus) => (
              <li
                key={focus.id}
                className="border-b border-border py-3 last:border-b-0"
              >
                <Link
                  href={`/review/foci/${focus.id}`}
                  className="block rounded-xl p-2 transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                >
                  <p className="font-semibold leading-tight text-foreground underline decoration-border underline-offset-4">
                    {focus.title}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {focus.tuneCount}{" "}
                    {pluralise(focus.tuneCount, "tune", "tunes")} ·{" "}
                    {focus.noteCount}{" "}
                    {pluralise(focus.noteCount, "note", "notes")}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {fallbackNotes.length > 0 ? (
        <section className="grid gap-2">
          <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Notes
          </h4>

          <ul className="rounded-2xl border border-border bg-card px-3 shadow-sm md:bg-background/70">
            {fallbackNotes.map((note) => (
              <li
                key={note.id}
                className="border-b border-border py-3 last:border-b-0"
              >
                <Link
                  href={getNoteDayHref(note)}
                  className="block rounded-xl p-2 transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                >
                  <p className="line-clamp-2 text-sm leading-6 text-foreground">
                    {note.body}
                  </p>

                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {note.piece ? `${note.piece.title} · ` : ""}
                    {formatDateOnly(note.noteDate)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </section>
  )
}

export default function PracticeDiaryIndex({ data }: PracticeDiaryIndexProps) {
  const [activeView, setActiveView] = useState<PracticeIndexView>("foci")
  const [query, setQuery] = useState("")
  const normalisedQuery = normaliseSearch(query)
  const currentView = views.find((view) => view.value === activeView) ?? views[0]
  const allNotes = useMemo(() => getAllNotes(data), [data])

  const filteredFoci = useMemo(
    () =>
      data.focusSummaries.filter((focus) =>
        searchableIncludes(
          [
            focus.title,
            focus.description,
            focus.status,
            focus.targetDate,
            ...focus.tuneTitles,
            ...focus.recentNotes.flatMap((note) => [
              note.body,
              note.categoryName,
              note.piece?.title,
              note.piece?.key,
              note.piece?.style,
              note.piece?.time_signature,
              note.noteDate,
            ]),
          ],
          normalisedQuery
        )
      ),
    [data.focusSummaries, normalisedQuery]
  )

  const filteredNotes = useMemo(
    () =>
      allNotes.filter((note) =>
        searchableIncludes(
          [
            note.body,
            note.categoryName,
            note.categoryPrompt,
            note.focus?.title,
            note.focus?.description,
            note.piece?.title,
            note.piece?.key,
            note.piece?.style,
            note.piece?.time_signature,
            note.noteDate,
            getKindLabel(note.kind),
          ],
          normalisedQuery
        )
      ),
    [allNotes, normalisedQuery]
  )

  function handleViewChange(nextView: PracticeIndexView) {
    setActiveView(nextView)
    setQuery("")
  }

  const fallback = (
    <FallbackMatches
      activeView={activeView}
      query={query}
      foci={filteredFoci}
      notes={filteredNotes}
    />
  )

  return (
    <section className="grid gap-4 md:gap-5">
      <div className="grid gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm md:rounded-3xl md:p-5">
        <PracticeIndexSwitcher
          activeView={activeView}
          onViewChange={handleViewChange}
        />

        <PracticeIndexSearch
          activeView={activeView}
          query={query}
          onQueryChange={setQuery}
        />
      </div>

      <section className="grid gap-3">
        <div className="px-1">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {currentView.heading}
          </h2>
        </div>

        {activeView === "foci" ? (
          filteredFoci.length > 0 ? (
            <CardPager
              items={filteredFoci}
              getKey={(focus) => focus.id}
              renderItem={(focus) => <PracticeFocusCard focus={focus} />}
              emptyState={
                <EmptyState>
                  No focus areas yet. Create one when several tunes share the
                  same problem or goal.
                </EmptyState>
              }
              label="Practice focus areas"
            />
          ) : data.focusSummaries.length === 0 ? (
            <EmptyState>
              No focus areas yet. Create one when several tunes share the same
              problem or goal.
            </EmptyState>
          ) : (
            <div className="grid gap-4">
              <EmptyState>No focus areas match “{query}”.</EmptyState>
              {fallback}
            </div>
          )
        ) : filteredNotes.length > 0 ? (
          <CardPager
            items={filteredNotes}
            getKey={(note) => note.id}
            renderItem={(note) => <PracticeNoteCard note={note} />}
            emptyState={
              <EmptyState>
                No diary notes have been indexed yet. Review tunes, add tune
                notes, or write daily reflections to build this view.
              </EmptyState>
            }
            label="Practice notes"
          />
        ) : allNotes.length === 0 ? (
          <EmptyState>
            No diary notes have been indexed yet. Review tunes, add tune notes,
            or write daily reflections to build this view.
          </EmptyState>
        ) : (
          <div className="grid gap-4">
            <EmptyState>No notes match “{query}”.</EmptyState>
            {fallback}
          </div>
        )}
      </section>
    </section>
  )
}
