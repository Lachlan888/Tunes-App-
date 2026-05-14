import Link from "next/link"
import type { PracticeDueTune } from "@/lib/loaders/practice-diary"

type PracticeDueTuneListProps = {
  dueTunes: PracticeDueTune[]
  emptyMessage: string
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
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              {dueTune.piece ? (
                <Link
                  href={`/library/${dueTune.piece.id}`}
                  className="block truncate font-serif text-2xl font-bold leading-tight text-foreground transition hover:text-primary"
                >
                  {dueTune.piece.title}
                </Link>
              ) : (
                <h3 className="truncate font-serif text-2xl font-bold leading-tight text-foreground">
                  Unknown tune
                </h3>
              )}
            </div>

            <span className="shrink-0 rounded-full border border-accent bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-accent-foreground">
              Stage {dueTune.stage}
            </span>
          </div>
        </article>
      ))}
    </div>
  )
}