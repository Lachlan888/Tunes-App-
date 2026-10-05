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
      <p className="border-b border-hairline bg-surface-note px-4 py-4 text-sm leading-6 text-muted-foreground">
        {emptyMessage}
      </p>
    )
  }

  return (
    <div className="border-t border-hairline">
      {dueTunes.map((dueTune) => (
        <article
          key={`${dueTune.userPieceId}-${dueTune.dueDate}`}
          className="border-b border-hairline px-1 py-4 lg:px-2"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              {dueTune.piece ? (
                <Link
                  href={`/library/${dueTune.piece.id}`}
                  className="line-clamp-2 block overflow-hidden font-sans font-bold leading-[1.08] text-foreground transition hover:text-primary"
                  style={{
                    fontSize: "clamp(1.05rem, 4.6vw, 1.45rem)",
                  }}
                >
                  {dueTune.piece.title}
                </Link>
              ) : (
                <h3
                  className="line-clamp-2 overflow-hidden font-sans font-bold leading-[1.08] text-foreground"
                  style={{
                    fontSize: "clamp(1.05rem, 4.6vw, 1.45rem)",
                  }}
                >
                  Unknown tune
                </h3>
              )}
            </div>

            <span className="shrink-0 border-l-2 border-state-practice px-2.5 py-1 text-xs font-semibold text-text-muted">
              Stage {dueTune.stage}
            </span>
          </div>
        </article>
      ))}
    </div>
  )
}
