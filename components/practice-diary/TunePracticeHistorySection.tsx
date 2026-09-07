import Link from "next/link"
import StatusMark, { type StatusTone } from "@/components/ui/StatusMark"
import type {
  TunePracticeNote,
  TuneReviewSummary,
} from "@/lib/loaders/tune-detail"

type TunePracticeHistorySectionProps = {
  notes: TunePracticeNote[]
  reviews: TuneReviewSummary[]
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Australia/Melbourne",
  }).format(new Date(value))
}

function getOutcomeLabel(outcome: string) {
  if (outcome === "failed" || outcome === "rough") return "Rough"
  if (outcome === "shaky") return "Shaky"
  if (outcome === "solid") return "Solid"
  return outcome.replaceAll("_", " ")
}

function getOutcomeTone(outcome: string): StatusTone {
  if (outcome === "failed" || outcome === "rough") return "rough"
  if (outcome === "shaky") return "shaky"
  if (outcome === "solid") return "solid"
  return "neutral"
}

export default function TunePracticeHistorySection({
  notes,
  reviews,
}: TunePracticeHistorySectionProps) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Practice history
      </h2>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Recent review outcomes and dated Practice Diary notes for this tune.
      </p>

      {reviews.length > 0 ? (
        <ol className="mt-5 divide-y divide-hairline rounded-object bg-surface-note px-4">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <StatusMark tone={getOutcomeTone(review.outcome)}>
                  {getOutcomeLabel(review.outcome)}
                </StatusMark>
                {review.resulting_stage ? (
                  <span className="text-sm font-medium text-text-primary">
                    Stage {review.resulting_stage}
                  </span>
                ) : null}
              </div>
              <time
                dateTime={review.created_at}
                className="text-sm text-text-muted"
              >
                {formatDate(review.created_at)}
              </time>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-5 rounded-object bg-surface-note p-4 text-sm text-text-muted">
          No formal review results for this tune yet.
        </p>
      )}

      {notes.length === 0 ? (
        <p className="mt-4 rounded-object bg-surface-note p-4 text-sm text-text-muted">
          No diary notes for this tune yet.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {notes.slice(0, 5).map((note) => (
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
