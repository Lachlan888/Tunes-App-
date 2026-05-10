import Link from "next/link"
import PracticeNoteForm from "@/components/practice-diary/PracticeNoteForm"
import type {
  PracticeDiaryEventWithNotes,
  PracticeNoteCategory,
} from "@/lib/loaders/practice-diary"

type PracticeEventListProps = {
  events: PracticeDiaryEventWithNotes[]
  categories: PracticeNoteCategory[]
  practiceDate: string
  redirectTo: string
}

function getOutcomeLabel(outcome: string | null | undefined) {
  if (outcome === "solid") return "Solid"
  if (outcome === "shaky") return "Shaky"
  if (outcome === "failed") return "Rough"
  return "Logged"
}

function getEventTypeLabel(event: PracticeDiaryEventWithNotes) {
  if (event.event_type === "formal_review") {
    return "Review"
  }

  if (event.event_type === "setlist_prep") {
    return "Setlist prep"
  }

  if (event.event_type === "gig_prep") {
    return "Gig prep"
  }

  if (event.event_type === "tune_target_work") {
    return "Target work"
  }

  if (event.event_type === "free_practice") {
    return "Free practice"
  }

  return "Practice"
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value))
}

export default function PracticeEventList({
  events,
  categories,
  practiceDate,
  redirectTo,
}: PracticeEventListProps) {
  if (events.length === 0) {
    return (
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Tunes practised
        </h2>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Nothing has been logged for this day yet. Formal reviews will appear
          here automatically once the Practice Diary is enabled.
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Tunes practised
          </h2>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            These are formal reviews and practice events logged on this day.
          </p>
        </div>

        <p className="text-sm font-medium text-muted-foreground">
          {events.length} {events.length === 1 ? "event" : "events"}
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {events.map((event) => {
          const title = event.piece?.title ?? "Unknown tune"
          const outcome = getOutcomeLabel(event.review_event?.outcome)
          const eventType = getEventTypeLabel(event)

          return (
            <article
              key={event.id}
              className="rounded-2xl border border-border bg-background/70 p-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {eventType} · {formatTime(event.created_at)}
                  </p>

                  {event.piece ? (
                    <Link
                      href={`/library/${event.piece.id}`}
                      className="mt-1 inline-flex font-serif text-2xl font-bold text-foreground transition hover:text-primary"
                    >
                      {title}
                    </Link>
                  ) : (
                    <h3 className="mt-1 font-serif text-2xl font-bold text-foreground">
                      {title}
                    </h3>
                  )}

                  {event.piece && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {[event.piece.key, event.piece.style, event.piece.time_signature]
                        .filter(Boolean)
                        .join(" · ") || "No metadata yet"}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {event.counted_as_review && (
                    <span className="rounded-full border border-success bg-success px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-success-foreground">
                      Counts as review
                    </span>
                  )}

                  <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {outcome}
                  </span>

                  {typeof event.review_event?.resulting_stage === "number" && (
                    <span className="rounded-full border border-accent bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-accent-foreground">
                      Stage {event.review_event.resulting_stage}
                    </span>
                  )}
                </div>
              </div>

              {event.notes.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {event.notes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-2xl border border-border bg-card p-4"
                    >
                      {note.category ? (
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          {note.category.name}
                        </p>
                      ) : null}

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">
                        {note.body}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}

              <PracticeNoteForm
                practiceDate={practiceDate}
                redirectTo={redirectTo}
                categories={categories}
                practiceEventId={event.id}
                pieceId={event.piece_id}
                reviewEventId={event.review_event_id}
                label="Add note for this tune"
              />
            </article>
          )
        })}
      </div>
    </section>
  )
}