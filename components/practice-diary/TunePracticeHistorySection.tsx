import Link from "next/link"
import StatusMark, { type StatusTone } from "@/components/ui/StatusMark"
import type {
  TunePracticeNote,
  TuneReviewSummary,
} from "@/lib/loaders/tune-detail"

type TunePracticeHistorySectionProps = {
  notes: TunePracticeNote[]
  reviews: TuneReviewSummary[]
  showStage: boolean
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
  showStage,
}: TunePracticeHistorySectionProps) {
  return (
    <section className="border-t border-hairline py-6">
      <h2 className="text-xl font-bold tracking-tight text-text-primary">
        Practice history
      </h2>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Recent review outcomes and dated Practice Diary notes for this tune.
      </p>

      {reviews.length > 0 ? (
        <ol className="mt-5 divide-y divide-hairline border-y border-hairline">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <StatusMark tone={getOutcomeTone(review.outcome)}>
                  {getOutcomeLabel(review.outcome)}
                </StatusMark>
                {showStage && review.resulting_stage ? (
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
        <p className="mt-5 border-y border-hairline py-4 text-sm text-text-muted">
          No formal review results for this tune yet.
        </p>
      )}

      {notes.length === 0 ? (
        <p className="mt-4 py-4 text-sm text-text-muted">
          No diary notes for this tune yet.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-hairline border-y border-hairline">
          {notes.slice(0, 5).map((note) => (
            <li
              key={note.id}
              className="py-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/review/diary?date=${note.practice_date}`}
                  className="text-sm font-semibold text-primary underline underline-offset-4 hover:text-primary-hover"
                >
                  {formatDate(note.created_at)}
                </Link>

                {note.category_name ? (
                  <span className="border-l-2 border-hairline pl-2 text-xs font-semibold text-text-muted">
                    {note.category_name}
                  </span>
                ) : null}

                {note.outcome ? (
                  <span className="border-l-2 border-state-practice pl-2 text-xs font-semibold text-state-practice">
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
