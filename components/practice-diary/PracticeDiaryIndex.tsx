import Link from "next/link"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import type {
  PracticeIndexCategoryGroup,
  PracticeIndexData,
  PracticeIndexItem,
} from "@/lib/loaders/practice-index"

type PracticeDiaryIndexProps = {
  data: PracticeIndexData
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

function PracticeIndexFilters({ data }: PracticeDiaryIndexProps) {
  return (
    <form
      action="/review/diary/index"
      className="rounded-2xl border border-border bg-card p-4 shadow-sm md:rounded-3xl md:p-5"
    >
      <div className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <label className="grid gap-1 text-sm font-medium text-foreground">
          Search
          <input
            name="q"
            type="search"
            defaultValue={data.filters.q}
            placeholder="Search note text, categories, tunes..."
            className="min-h-11 rounded-2xl border border-border bg-background/70 px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          />
        </label>

        <label className="grid gap-1 text-sm font-medium text-foreground">
          Category
          <select
            name="category"
            defaultValue={data.filters.categoryId ?? ""}
            className="min-h-11 rounded-2xl border border-border bg-background/70 px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          >
            <option value="">All categories</option>
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
          Sort categories
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
  )
}

function PracticeIndexSummary({ data }: PracticeDiaryIndexProps) {
  return (
    <section className="grid gap-3 md:grid-cols-4">
      <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Notes indexed
        </p>

        <p className="mt-2 font-serif text-4xl font-bold text-foreground">
          {data.summary.totalNotes}
        </p>
      </article>

      <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Categories
        </p>

        <p className="mt-2 font-serif text-4xl font-bold text-foreground">
          {data.summary.categoryGroups}
        </p>
      </article>

      <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Categorised
        </p>

        <p className="mt-2 font-serif text-4xl font-bold text-foreground">
          {data.summary.categorisedNotes}
        </p>
      </article>

      <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Tunes mentioned
        </p>

        <p className="mt-2 font-serif text-4xl font-bold text-foreground">
          {data.summary.tunesMentioned}
        </p>
      </article>
    </section>
  )
}

function PracticeIndexNoteCard({ note }: { note: PracticeIndexItem }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-sm md:rounded-xl md:bg-background/70 md:p-3 md:shadow-none">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <span
              className={joinClasses(
                "rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em]",
                getKindTone(note.kind)
              )}
            >
              {getKindLabel(note.kind)}
            </span>

            {note.piece ? (
              <Link
                href={`/library/${note.piece.id}`}
                className="rounded-full border border-border bg-muted px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground transition hover:text-primary"
              >
                {note.piece.title}
              </Link>
            ) : null}
          </div>
        </div>

        <Link
          href={`/review/diary?view=day&date=${note.noteDate}`}
          className="text-sm font-medium text-muted-foreground transition hover:text-primary hover:underline"
        >
          {formatDateOnly(note.noteDate)}
        </Link>
      </div>

      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground">
        {note.body}
      </p>
    </article>
  )
}

function PracticeIndexMobileCategoryGroup({
  group,
}: {
  group: PracticeIndexCategoryGroup
}) {
  return (
    <section className="md:hidden">
      <div className="px-1">
        <h2 className="font-serif text-3xl font-bold leading-tight text-foreground">
          {group.categoryName}
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
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

      <div className="mt-3 space-y-3">
        {group.notes.map((note) => (
          <PracticeIndexNoteCard key={note.id} note={note} />
        ))}
      </div>
    </section>
  )
}

function PracticeIndexDesktopCategoryGroup({
  group,
}: {
  group: PracticeIndexCategoryGroup
}) {
  return (
    <section className="hidden rounded-3xl border border-border bg-card p-5 shadow-sm md:block">
      <div>
        <h2 className="font-serif text-3xl font-bold text-foreground">
          {group.categoryName}
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
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

      <div className="mt-4 space-y-3">
        {group.notes.map((note) => (
          <PracticeIndexNoteCard key={note.id} note={note} />
        ))}
      </div>
    </section>
  )
}

function PracticeIndexCategoryGroup({
  group,
}: {
  group: PracticeIndexCategoryGroup
}) {
  return (
    <>
      <PracticeIndexMobileCategoryGroup group={group} />
      <PracticeIndexDesktopCategoryGroup group={group} />
    </>
  )
}

export default function PracticeDiaryIndex({ data }: PracticeDiaryIndexProps) {
  return (
    <div className="space-y-5 md:space-y-6">
      <PracticeIndexFilters data={data} />

      <div className="hidden md:block">
        <PracticeIndexSummary data={data} />
      </div>

      <section className="hidden rounded-2xl border border-border bg-card p-4 shadow-sm md:block md:rounded-3xl md:p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Category index
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Notes are combined by practice category so repeated patterns become
          visible across days and tunes.
        </p>
      </section>

      {data.categoryGroups.length > 0 ? (
        <div className="space-y-7 md:space-y-4">
          {data.categoryGroups.map((group) => (
            <PracticeIndexCategoryGroup key={group.key} group={group} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-border bg-card p-5 text-sm leading-6 text-muted-foreground shadow-sm">
          No indexed notes match these filters.
        </p>
      )}
    </div>
  )
}