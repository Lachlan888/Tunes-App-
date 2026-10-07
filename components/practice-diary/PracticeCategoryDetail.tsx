import Link from "next/link"
import { formatPracticeDate } from "@/lib/review"
import type {
  PracticeCategoryDetailData,
  PracticeCategoryDetailNote,
  PracticeCategoryTuneSummary,
} from "@/lib/loaders/practice-index"

type PracticeCategoryDetailProps = {
  data: PracticeCategoryDetailData
}

function formatDateOnly(dateOnly: string | null) {
  return formatPracticeDate(dateOnly) ?? "No notes yet"
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
    <section>
      <h2 className="font-sans text-xl font-bold tracking-tight text-foreground">
        Category map
      </h2>

      <div className="mt-3 grid grid-cols-3 divide-x divide-hairline border-t border-hairline">
        {stats.map((stat) => (
          <article
            key={stat.label}
          className="min-w-0 px-3 py-4 first:pl-0 last:pr-0 md:px-5"
          >
            <p className="text-xs font-medium text-muted-foreground">
              {stat.label}
            </p>

            <p
              className={
                stat.isDate
                  ? "mt-1 break-words text-base font-bold leading-tight text-foreground md:text-2xl"
                  : "mt-1 truncate text-2xl font-bold leading-tight text-foreground md:text-3xl"
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
      <Link
        href={`/library/${tune.piece.id}`}
        className="break-words font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-primary"
      >
        {tune.piece.title}
      </Link>
      <p className="mt-1 text-sm leading-5 text-muted-foreground">
        {tune.noteCount} {pluralise(tune.noteCount, "note", "notes")} ·
        latest {formatDateOnly(tune.latestDate)}
      </p>
    </li>
  )
}

function CategoryTunesSection({ data }: PracticeCategoryDetailProps) {
  return (
    <section className="border-t border-hairline pt-4">
      <h2 className="font-sans text-xl font-bold tracking-tight text-foreground">
        Tunes in this category
      </h2>

      {data.tuneSummaries.length > 0 ? (
        <ul className="mt-3 divide-y divide-hairline">
          {data.tuneSummaries.map((tune) => (
            <TuneSummaryRow key={tune.piece.id} tune={tune} />
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          No tune-linked notes in this category yet.
        </p>
      )}
    </section>
  )
}

function NoteRow({ note }: { note: PracticeCategoryDetailNote }) {
  return (
    <li className="border-b border-border py-4 last:border-b-0">
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
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
    <section className="border-t border-hairline pt-4">
      <h2 className="font-sans text-xl font-bold tracking-tight text-foreground">
        Notes
      </h2>

      {data.notes.length > 0 ? (
        <ul className="mt-3 divide-y divide-hairline">
          {data.notes.map((note) => (
            <NoteRow key={note.id} note={note} />
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
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

      <section className="grid gap-8 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] xl:gap-10">
        <CategoryTunesSection data={data} />
        <CategoryNotesSection data={data} />
      </section>
    </div>
  )
}
