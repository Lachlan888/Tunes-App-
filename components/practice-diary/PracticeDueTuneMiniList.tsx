"use client"

import { useState } from "react"
import Link from "next/link"
import type { PracticeDueTune } from "@/lib/loaders/practice-diary"

type PracticeDueTuneMiniListProps = {
  dueTunes: PracticeDueTune[]
  initialVisibleCount: number
}

function getDueTuneTitle(dueTune: PracticeDueTune) {
  return dueTune.piece?.title ?? "Unknown tune"
}

export default function PracticeDueTuneMiniList({
  dueTunes,
  initialVisibleCount,
}: PracticeDueTuneMiniListProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!dueTunes || dueTunes.length === 0) {
    return null
  }

  const visibleDueTunes = isExpanded
    ? dueTunes
    : dueTunes.slice(0, initialVisibleCount)
  const hiddenCount = Math.max(dueTunes.length - visibleDueTunes.length, 0)

  return (
    <div className="mt-3 border-t border-border pt-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        Due
      </p>

      <ul className="mt-2 list-disc space-y-1 pl-4 text-xs italic leading-5 text-muted-foreground">
        {visibleDueTunes.map((dueTune) => (
          <li key={`${dueTune.userPieceId}-${dueTune.dueDate}`}>
            {dueTune.piece ? (
              <Link
                href={`/library/${dueTune.piece.id}`}
                className="transition hover:text-primary hover:underline"
              >
                {getDueTuneTitle(dueTune)}
              </Link>
            ) : (
              getDueTuneTitle(dueTune)
            )}
          </li>
        ))}
      </ul>

      {hiddenCount > 0 ? (
        <button
          type="button"
          className="mt-1 text-xs italic text-muted-foreground transition hover:text-primary hover:underline"
          onClick={() => setIsExpanded(true)}
        >
          +{hiddenCount} more
        </button>
      ) : isExpanded && dueTunes.length > initialVisibleCount ? (
        <button
          type="button"
          className="mt-1 text-xs italic text-muted-foreground transition hover:text-primary hover:underline"
          onClick={() => setIsExpanded(false)}
        >
          Show less
        </button>
      ) : null}
    </div>
  )
}