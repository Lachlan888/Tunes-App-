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
  if (outcome === "rough") return "Rough"

  return "Logged"
}

function getDisplayOutcome(event: PracticeDiaryEventWithNotes) {
  return event.review_event?.outcome ?? event.practice_outcome
}

function getEventTypeLabel(event: PracticeDiaryEventWithNotes) {
  if (event.event_type === "formal_review") {
    return "Review"
  }

  if (event.event_type === "free_practice" && event.practice_outcome) {
    return "Practice check"
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

function NoteContextLabels({
  category,
  focus,
}: {
  category: PracticeNoteCategory | null
  focus: {
    id: number
    title: string
    description: string | null
    status: string
  } | null
}) {
  if (!category && !focus) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
      {category ? (
        <Link
          href={`/review/diary/categories/${category.id}`}
          className="rounded-full border border-border bg-muted px-2.5 py-1 text-muted-foreground transition hover:border-primary hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          title={category.prompt ?? undefined}
        >
          {category.name}
        </Link>
      ) : null}

      {focus ? (
        <Link
          href={`/review/foci/${focus.id}`}
          className="rounded-full border border-border bg-background/70 px-2.5 py-1 text-muted-foreground transition hover:border-primary hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          title={focus.description ?? undefined}
        >
          Focus: {focus.title}
        </Link>
      ) : null}
    </div>
  )
}

export default function PracticeEventList({
  events,
  categories,
  practiceDate,
  redirectTo,
}: PracticeEventListProps) {
  if (events.length === 0) {
    return (
      <section className="space-y-3 md:rounded-3xl md:border md:border-border md:bg-card md:p-6 md:shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Reviewed tunes
        </h2>

        <p className="text-sm leading-6 text-muted-foreground md:mt-3">
          Nothing has been logged for this day yet. Formal reviews and
          diary-only practice checks will appear here once the Practice Diary is
          enabled.
        </p>
      </section>
    )
  }

  return (
    <section className="space-y-4 md:rounded-3xl md:border md:border-border md:bg-card md:p-6 md:shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Reviewed tunes
          </h2>

          <p className="mt-2 text-sm font-medium text-muted-foreground md:hidden">
            {events.length} {events.length === 1 ? "event" : "events"}
          </p>

          <p className="mt-3 hidden text-sm leading-6 text-muted-foreground md:block">
            Tune-specific practice records for this date.
          </p>
        </div>

        <p className="hidden text-sm font-medium text-muted-foreground md:block">
          {events.length} {events.length === 1 ? "event" : "events"}
        </p>
      </div>

      <div className="md:mt-5 md:space-y-3">
        {events.map((event, index) => {
          const title = event.piece?.title ?? "Unknown tune"
          const outcome = getOutcomeLabel(getDisplayOutcome(event))
          const eventType = getEventTypeLabel(event)

          return (
            <article
              key={event.id}
              className={[
                "-mx-4 space-y-4 px-4 py-6 md:mx-0 md:rounded-2xl md:border md:border-border md:bg-background/70 md:p-4 md:shadow-sm",
                index === 0 ? "pt-1" : "border-t border-border",
              ].join(" ")}
            >
              <div className="space-y-3">
                <div className="min-w-0">
                  {event.piece ? (
                    <Link
                      href={`/library/${event.piece.id}`}
                      className="group inline-flex max-w-full items-baseline gap-2 font-serif text-2xl font-bold leading-tight text-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 md:text-2xl"
                    >
                      <span className="break-words underline decoration-border decoration-2 underline-offset-4 transition group-hover:decoration-primary">
                        {title}
                      </span>

                      <span
                        aria-hidden="true"
                        className="shrink-0 text-base font-bold text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary"
                      >
                        ↗
                      </span>
                    </Link>
                  ) : (
                    <h3 className="font-serif text-2xl font-bold leading-tight text-foreground md:text-2xl">
                      {title}
                    </h3>
                  )}

                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {eventType} · {formatTime(event.created_at)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {outcome}
                  </span>

                  {typeof event.review_event?.resulting_stage === "number" && (
                    <span className="rounded-full border border-accent bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-accent-foreground">
                      Stage {event.review_event.resulting_stage}
                    </span>
                  )}

                  {event.event_type === "free_practice" &&
                  event.practice_outcome ? (
                    <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Diary only
                    </span>
                  ) : null}
                </div>
              </div>

              {event.notes.length > 0 ? (
                <div className="space-y-3">
                  {event.notes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-2xl border border-border bg-card/70 p-4 shadow-sm md:bg-card"
                    >
                      <div className="mb-3 flex flex-col gap-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Note
                        </p>

                        <NoteContextLabels
                          category={note.category}
                          focus={note.focus}
                        />
                      </div>

                      <p className="whitespace-pre-wrap text-lg leading-8 text-foreground md:text-base md:leading-7">
                        {note.body}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="pt-2">
                <PracticeNoteForm
                  practiceDate={practiceDate}
                  redirectTo={redirectTo}
                  categories={categories}
                  practiceEventId={event.id}
                  pieceId={event.piece_id}
                  reviewEventId={event.review_event_id}
                  labelTuneName={title}
                />
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}