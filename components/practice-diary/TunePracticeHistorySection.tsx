import Link from "next/link"
import type { TunePracticeNote } from "@/lib/loaders/tune-detail"

type TunePracticeHistorySectionProps = {
  notes: TunePracticeNote[]
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

export default function TunePracticeHistorySection({
  notes,
}: TunePracticeHistorySectionProps) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Practice history
      </h2>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Dated notes from your Practice Diary for this tune. These are separate
        from the stable private notes above.
      </p>

      {notes.length === 0 ? (
        <p className="mt-5 rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
          No diary notes for this tune yet.
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {notes.map((note) => (
            <li
              key={note.id}
              className="rounded-2xl border border-border bg-background/70 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/review/diary?date=${note.practice_date}`}
                  className="text-sm font-semibold text-primary underline underline-offset-4 hover:text-primary-hover"
                >
                  {formatDate(note.created_at)}
                </Link>

                {note.category_name ? (
                  <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {note.category_name}
                  </span>
                ) : null}

                {note.outcome ? (
                  <span className="rounded-full border border-accent bg-accent/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-accent-foreground">
                    {note.outcome === "failed"
                      ? "Rough"
                      : note.outcome === "shaky"
                        ? "Shaky"
                        : note.outcome === "solid"
                          ? "Solid"
                          : note.outcome}
                  </span>
                ) : null}
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground">
                {note.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}