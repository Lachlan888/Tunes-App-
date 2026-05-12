import Link from "next/link"
import type { PracticeDueTune } from "@/lib/loaders/practice-diary"

type PracticeDueTuneListProps = {
  dueTunes: PracticeDueTune[]
  emptyMessage: string
}

function formatDateOnly(dateOnly: string) {
  const [year, month, day] = dateOnly.split("-")

  if (!year || !month || !day) {
    return dateOnly
  }

  return `${day}/${month}/${year}`
}

export default function PracticeDueTuneList({
  dueTunes,
  emptyMessage,
}: PracticeDueTuneListProps) {
  if (dueTunes.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
        {emptyMessage}
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {dueTunes.map((dueTune) => (
        <article
          key={`${dueTune.userPieceId}-${dueTune.dueDate}`}
          className="rounded-2xl border border-border bg-background/70 p-4 shadow-sm"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              {dueTune.piece ? (
                <Link
                  href={`/library/${dueTune.piece.id}`}
                  className="font-serif text-2xl font-bold text-foreground transition hover:text-primary"
                >
                  {dueTune.piece.title}
                </Link>
              ) : (
                <h3 className="font-serif text-2xl font-bold text-foreground">
                  Unknown tune
                </h3>
              )}

              {dueTune.piece ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  {[
                    dueTune.piece.key,
                    dueTune.piece.style,
                    dueTune.piece.time_signature,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "No metadata yet"}
                </p>
              ) : null}

              <p className="mt-2 text-sm text-muted-foreground">
                Due {formatDateOnly(dueTune.dueDate)}
              </p>
            </div>

            <span className="rounded-full border border-accent bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-accent-foreground">
              Stage {dueTune.stage}
            </span>
          </div>
        </article>
      ))}
    </div>
  )
}