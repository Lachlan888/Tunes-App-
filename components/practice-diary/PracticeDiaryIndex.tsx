import Link from "next/link"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import type {
  PracticeIndexCategoryGroup,
  PracticeIndexData,
  PracticeIndexFocusSummary,
  PracticeIndexItem,
} from "@/lib/loaders/practice-index"

type PracticeDiaryIndexProps = {
  data: PracticeIndexData
}

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

function getLatestNotes(data: PracticeIndexData) {
  const notesById = new Map<string, PracticeIndexItem>()

  for (const group of data.categoryGroups) {
    for (const note of group.notes) {
      notesById.set(note.id, note)
    }
  }

  return Array.from(notesById.values())
    .sort((a, b) => {
      const dateCompare = b.noteDate.localeCompare(a.noteDate)

      if (dateCompare !== 0) {
        return dateCompare
      }

      return b.createdAt.localeCompare(a.createdAt)
    })
    .slice(0, 6)
}

function PracticeMapSummary({ data }: PracticeDiaryIndexProps) {
  const stats = [
    {
      label: "Active foci",
      value: data.summary.activeFoci,
    },
    {
      label: "Notes indexed",
      value: data.summary.totalNotes,
    },
    {
      label: "Note categories",
      value: data.summary.categoryGroups,
    },
    {
      label: "Tunes mentioned",
      value: data.summary.tunesMentioned,
    },
  ]

  return (
    <section className="grid gap-3 md:rounded-3xl md:border md:border-border md:bg-card md:p-5 md:shadow-sm">
      <div className="px-1 md:px-0">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Practice map
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-2xl border border-border bg-card p-4 shadow-sm md:bg-background/70 md:shadow-none"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {stat.label}
            </p>

            <p className="mt-2 font-serif text-4xl font-bold text-foreground">
              {stat.value}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}

function PracticeIndexFilters({ data }: PracticeDiaryIndexProps) {
  return (
    <details className="rounded-2xl border border-border bg-card p-4 shadow-sm md:rounded-3xl md:p-5">
      <summary className="cursor-pointer text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Find notes
      </summary>

      <form action="/review/diary/index" className="mt-4">
        <div className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <label className="grid gap-1 text-sm font-medium text-foreground">
            Search notes
            <input
              name="q"
              type="search"
              defaultValue={data.filters.q}
              placeholder="Search note text, categories, tunes..."
              className="min-h-11 rounded-2xl border border-border bg-background/70 px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
          </label>

          <label className="grid gap-1 text-sm font-medium text-foreground">
            Note category
            <select
              name="category"
              defaultValue={data.filters.categoryId ?? ""}
              className="min-h-11 rounded-2xl border border-border bg-background/70 px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            >
              <option value="">All note categories</option>
              {data.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-sm font-medium text-foreground">
            From
            <input
              name="from"
              type="date"
              defaultValue={data.filters.from}
              className="min-h-11 rounded-2xl border border-border bg-background/70 px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
          </label>

          <label className="grid gap-1 text-sm font-medium text-foreground">
            To
            <input
              name="to"
              type="date"
              defaultValue={data.filters.to}
              className="min-h-11 rounded-2xl border border-border bg-background/70 px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
          </label>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-end">
          <label className="grid gap-1 text-sm font-medium text-foreground">
            Sort note categories
            <select
              name="sort"
              defaultValue={data.filters.sort}
              className="min-h-11 rounded-2xl border border-border bg-background/70 px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            >
              <option value="mostNotes">Most notes</option>
              <option value="latest">Latest activity</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </label>

          <button type="submit" className={buttonStyles.primary}>
            Filter
          </button>

          <Link href="/review/diary/index" className={buttonStyles.secondary}>
            Clear
          </Link>
        </div>
      </form>
    </details>
  )
}

function PracticeFocusSummaryRow({
  focus,
}: {
  focus: PracticeIndexFocusSummary
}) {
  const latestNote = focus.recentNotes[0] ?? null

  return (
    <li className="border-b border-border py-4 last:border-b-0">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/review/foci/${focus.id}`}
              className="break-words font-medium text-foreground underline-offset-4 hover:underline"
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

          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            {focus.tuneCount} {pluralise(focus.tuneCount, "tune", "tunes")} ·{" "}
            {focus.noteCount} {pluralise(focus.noteCount, "note", "notes")} ·{" "}
            last touched {formatDateOnly(focus.lastTouchedDate)}
          </p>

          {latestNote ? (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
              <span className="font-medium text-foreground">Latest: </span>
              {latestNote.piece ? `${latestNote.piece.title}: ` : ""}
              {latestNote.body}
            </p>
          ) : focus.description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {focus.description}
            </p>
          ) : null}
        </div>

        <Link
          href={`/review/foci/${focus.id}`}
          className={`${buttonStyles.secondaryStrong} shrink-0 !px-3 !py-1.5 text-xs`}
        >
          Open
        </Link>
      </div>
    </li>
  )
}

function PracticeIndexFociSection({ data }: PracticeDiaryIndexProps) {
  return (
    <section className="grid gap-3 md:rounded-3xl md:border md:border-border md:bg-card md:p-5 md:shadow-sm">
      <div className="px-1 md:px-0">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Foci
        </h2>
      </div>

      {data.focusSummaries.length === 0 ? (
        <p className="rounded-2xl border border-border bg-card p-5 text-sm leading-6 text-muted-foreground shadow-sm md:bg-background/70 md:shadow-none">
          No practice foci yet. Create one when a few tunes are connected by the
          same musical problem or preparation goal.
        </p>
      ) : (
        <ul className="md:rounded-2xl md:border md:border-border md:bg-background/70 md:px-4">
          {data.focusSummaries.map((focus) => (
            <PracticeFocusSummaryRow key={focus.id} focus={focus} />
          ))}
        </ul>
      )}
    </section>
  )
}

function getCategoryHref(group: PracticeIndexCategoryGroup) {
  if (!group.categoryId) {
    return "/review/diary/index"
  }

  return `/review/diary/index/categories/${group.categoryId}`
}

function PracticeCategorySummaryRow({
  group,
}: {
  group: PracticeIndexCategoryGroup
}) {
  const categoryHref = getCategoryHref(group)

  return (
    <li className="border-b border-border py-4 last:border-b-0">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={categoryHref}
            className="break-words font-medium text-foreground underline-offset-4 hover:underline"
          >
            {group.categoryName}
          </Link>

          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            {group.noteCount} {pluralise(group.noteCount, "note", "notes")}
            {group.tuneCount > 0
              ? ` · ${group.tuneCount} ${pluralise(
                  group.tuneCount,
                  "tune",
                  "tunes"
                )}`
              : ""}
            {" · "}latest {formatDateOnly(group.latestDate)}
          </p>
        </div>

        {group.categoryId ? (
          <Link
            href={categoryHref}
            className={`${buttonStyles.secondaryStrong} shrink-0 !px-3 !py-1.5 text-xs`}
          >
            Open
          </Link>
        ) : null}
      </div>
    </li>
  )
}

function PracticeIndexCategoriesSection({ data }: PracticeDiaryIndexProps) {
  return (
    <section className="grid gap-3 md:rounded-3xl md:border md:border-border md:bg-card md:p-5 md:shadow-sm">
      <div className="px-1 md:px-0">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Note categories
        </h2>
      </div>

      {data.categoryGroups.length > 0 ? (
        <ul className="md:rounded-2xl md:border md:border-border md:bg-background/70 md:px-4">
          {data.categoryGroups.map((group) => (
            <PracticeCategorySummaryRow key={group.key} group={group} />
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-border bg-card p-5 text-sm leading-6 text-muted-foreground shadow-sm md:bg-background/70 md:shadow-none">
          No indexed notes match these filters.
        </p>
      )}
    </section>
  )
}

function PracticeIndexNoteRow({ note }: { note: PracticeIndexItem }) {
  return (
    <li className="border-b border-border py-4 last:border-b-0">
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        <span
          className={joinClasses(
            "rounded-full border px-2.5 py-1",
            getKindTone(note.kind)
          )}
        >
          {getKindLabel(note.kind)}
        </span>

        {note.categoryName ? <span>{note.categoryName}</span> : null}

        {note.piece ? (
          <Link
            href={`/library/${note.piece.id}`}
            className="underline decoration-border underline-offset-4 transition hover:text-foreground hover:decoration-primary"
          >
            {note.piece.title}
          </Link>
        ) : null}

        <Link
          href={`/review/diary?view=day&date=${note.noteDate}`}
          className="underline decoration-border underline-offset-4 transition hover:text-foreground hover:decoration-primary"
        >
          {formatDateOnly(note.noteDate)}
        </Link>
      </div>

      <p className="mt-2 line-clamp-3 text-sm leading-6 text-foreground">
        {note.body}
      </p>
    </li>
  )
}

function PracticeIndexRecentNotesSection({ data }: PracticeDiaryIndexProps) {
  const latestNotes = getLatestNotes(data)

  return (
    <section className="grid gap-3 md:rounded-3xl md:border md:border-border md:bg-card md:p-5 md:shadow-sm">
      <div className="px-1 md:px-0">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Recent notes
        </h2>
      </div>

      {latestNotes.length > 0 ? (
        <ul className="md:rounded-2xl md:border md:border-border md:bg-background/70 md:px-4">
          {latestNotes.map((note) => (
            <PracticeIndexNoteRow key={note.id} note={note} />
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-border bg-card p-5 text-sm leading-6 text-muted-foreground shadow-sm md:bg-background/70 md:shadow-none">
          No recent notes match these filters.
        </p>
      )}
    </section>
  )
}

export default function PracticeDiaryIndex({ data }: PracticeDiaryIndexProps) {
  return (
    <div className="space-y-7 md:space-y-6">
      <PracticeMapSummary data={data} />

      <section className="grid gap-6 xl:grid-cols-2">
        <PracticeIndexFociSection data={data} />
        <PracticeIndexCategoriesSection data={data} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <PracticeIndexFilters data={data} />
        <PracticeIndexRecentNotesSection data={data} />
      </section>
    </div>
  )
}