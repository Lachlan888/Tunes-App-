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
    <div className="space-y-2.5 lg:space-y-3">
      {dueTunes.map((dueTune) => (
        <article
          key={`${dueTune.userPieceId}-${dueTune.dueDate}`}
          className="rounded-xl border border-border bg-background/70 px-3 py-2.5 shadow-sm lg:rounded-2xl lg:p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              {dueTune.piece ? (
                <Link
                  href={`/library/${dueTune.piece.id}`}
                  className="line-clamp-2 block overflow-hidden font-serif font-bold leading-[1.08] text-foreground transition hover:text-primary"
                  style={{
                    fontSize: "clamp(1.05rem, 4.6vw, 1.45rem)",
                  }}
                >
                  {dueTune.piece.title}
                </Link>
              ) : (
                <h3
                  className="line-clamp-2 overflow-hidden font-serif font-bold leading-[1.08] text-foreground"
                  style={{
                    fontSize: "clamp(1.05rem, 4.6vw, 1.45rem)",
                  }}
                >
                  Unknown tune
                </h3>
              )}
            </div>

            <span className="shrink-0 rounded-full border border-accent bg-accent px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-accent-foreground lg:px-3 lg:py-1 lg:text-xs">
              Stage {dueTune.stage}
            </span>
          </div>
        </article>
      ))}
    </div>
  )
}