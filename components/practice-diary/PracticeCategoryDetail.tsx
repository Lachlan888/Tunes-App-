import Link from "next/link"
import { buttonStyles } from "@/components/ui/buttonStyles"
import type {
  PracticeCategoryDetailData,
  PracticeCategoryDetailNote,
  PracticeCategoryTuneSummary,
} from "@/lib/loaders/practice-index"

type PracticeCategoryDetailProps = {
  data: PracticeCategoryDetailData
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

function CategoryMapSummary({ data }: PracticeCategoryDetailProps) {
  const stats = [
    {
      label: "Notes",
      value: String(data.summary.totalNotes),
      isDate: false,
    },
    {
      label: "Tunes",
      value: String(data.summary.tunesMentioned),
      isDate: false,
    },
    {
      label: "Latest",
      value: formatDateOnly(data.summary.latestDate),
      isDate: true,
    },
  ]

  return (
    <section className="grid gap-3 md:rounded-3xl md:border md:border-border md:bg-card md:p-5 md:shadow-sm">
      <div className="px-1 md:px-0">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Category map
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-2xl border border-border bg-card p-3 shadow-sm md:grid-cols-3 md:gap-3 md:border-0 md:bg-background/70 md:p-0 md:shadow-none">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="min-w-0 border-r border-border pr-2 last:border-r-0 md:rounded-2xl md:border md:border-border md:bg-background/70 md:p-4"
          >
            <p className="truncate text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground md:text-xs md:tracking-[0.14em]">
              {stat.label}
            </p>

            <p
              className={
                stat.isDate
                  ? "mt-1 truncate text-base font-bold leading-tight text-foreground md:mt-2 md:font-serif md:text-4xl"
                  : "mt-1 truncate font-serif text-2xl font-bold leading-tight text-foreground md:mt-2 md:text-4xl"
              }
            >
              {stat.value}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}

function TuneSummaryRow({ tune }: { tune: PracticeCategoryTuneSummary }) {
  return (
    <li className="border-b border-border py-4 last:border-b-0">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/library/${tune.piece.id}`}
            className="break-words font-medium text-foreground underline-offset-4 hover:underline"
          >
            {tune.piece.title}
          </Link>

          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            {tune.noteCount} {pluralise(tune.noteCount, "note", "notes")} ·
            latest {formatDateOnly(tune.latestDate)}
          </p>

          {tune.latestSnippet ? (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {tune.latestSnippet}
            </p>
          ) : null}
        </div>

        <Link
          href={`/library/${tune.piece.id}`}
          className={`${buttonStyles.secondaryStrong} shrink-0 !px-3 !py-1.5 text-xs`}
        >
          Tune
        </Link>
      </div>
    </li>
  )
}

function CategoryTunesSection({ data }: PracticeCategoryDetailProps) {
  return (
    <section className="grid gap-3 md:rounded-3xl md:border md:border-border md:bg-card md:p-5 md:shadow-sm">
      <div className="px-1 md:px-0">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Tunes in this category
        </h2>
      </div>

      {data.tuneSummaries.length > 0 ? (
        <ul className="md:rounded-2xl md:border md:border-border md:bg-background/70 md:px-4">
          {data.tuneSummaries.map((tune) => (
            <TuneSummaryRow key={tune.piece.id} tune={tune} />
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-border bg-card p-5 text-sm leading-6 text-muted-foreground shadow-sm md:bg-background/70 md:shadow-none">
          No tune-linked notes in this category yet.
        </p>
      )}
    </section>
  )
}

function NoteRow({ note }: { note: PracticeCategoryDetailNote }) {
  return (
    <li className="border-b border-border py-4 last:border-b-0">
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        <Link
          href={`/review/diary?view=day&date=${note.noteDate}`}
          className="underline decoration-border underline-offset-4 transition hover:text-foreground hover:decoration-primary"
        >
          {formatDateOnly(note.noteDate)}
        </Link>

        {note.piece ? (
          <>
            <span aria-hidden="true">|</span>
            <Link
              href={`/library/${note.piece.id}`}
              className="underline decoration-border underline-offset-4 transition hover:text-foreground hover:decoration-primary"
            >
              {note.piece.title}
            </Link>
          </>
        ) : null}
      </div>

      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">
        {note.body}
      </p>
    </li>
  )
}

function CategoryNotesSection({ data }: PracticeCategoryDetailProps) {
  return (
    <section className="grid gap-3 md:rounded-3xl md:border md:border-border md:bg-card md:p-5 md:shadow-sm">
      <div className="px-1 md:px-0">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Notes
        </h2>
      </div>

      {data.notes.length > 0 ? (
        <ul className="md:rounded-2xl md:border md:border-border md:bg-background/70 md:px-4">
          {data.notes.map((note) => (
            <NoteRow key={note.id} note={note} />
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-border bg-card p-5 text-sm leading-6 text-muted-foreground shadow-sm md:bg-background/70 md:shadow-none">
          No notes have been saved to this category yet.
        </p>
      )}
    </section>
  )
}

export default function PracticeCategoryDetail({
  data,
}: PracticeCategoryDetailProps) {
  return (
    <div className="space-y-7 md:space-y-6">
      <CategoryMapSummary data={data} />

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <CategoryTunesSection data={data} />
        <CategoryNotesSection data={data} />
      </section>
    </div>
  )
}