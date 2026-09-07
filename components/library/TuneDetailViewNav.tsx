"use client"

import Link from "next/link"
import { useState } from "react"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { joinClasses } from "@/components/ui/buttonStyles"
import {
  getTuneDetailHref,
  type TuneDetailView,
} from "@/lib/tune-detail-view"

export type { TuneDetailView } from "@/lib/tune-detail-view"

const views: Array<{ value: TuneDetailView; label: string }> = [
  { value: "practice", label: "Practice" },
  { value: "reference", label: "Reference" },
  { value: "about", label: "About" },
]

export default function TuneDetailViewNav({
  pieceId,
  activeView,
}: {
  pieceId: number
  activeView: TuneDetailView
}) {
  const [pendingTarget, setPendingTarget] = useState<TuneDetailView | null>(null)
  const isPending = pendingTarget !== null && pendingTarget !== activeView

  return (
    <nav aria-label="Tune detail views" className="pb-1">
      <div className="grid grid-cols-3 gap-1 rounded-control border border-hairline bg-surface-note p-1">
        {views.map((view) => {
          const isActive = view.value === activeView

          return (
            <Link
              key={view.value}
              href={getTuneDetailHref(pieceId, view.value)}
              prefetch
              aria-current={isActive ? "page" : undefined}
              aria-disabled={isPending || isActive}
              onClick={(event) => {
                if (isActive || isPending) {
                  event.preventDefault()
                  return
                }
                setPendingTarget(view.value)
                window.setTimeout(() => {
                  setPendingTarget((current) =>
                    current === view.value ? null : current
                  )
                }, 3000)
              }}
              className={joinClasses(
                "inline-flex min-h-11 min-w-0 items-center justify-center gap-1 rounded-control px-2 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] aria-disabled:cursor-wait aria-disabled:opacity-70 sm:gap-2 sm:px-3",
                isActive
                  ? "bg-action-primary text-action-primary-foreground shadow-material-rest"
                  : "text-text-muted hover:bg-surface-paper hover:text-text-primary"
              )}
            >
              {isPending && pendingTarget === view.value ? (
                <LoadingSpinner label={`Opening ${view.label}`} size="sm" decorative />
              ) : null}
              {view.label}
            </Link>
          )
        })}

      </div>
    </nav>
  )
}
