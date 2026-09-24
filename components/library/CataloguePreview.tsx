"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import InlineReferencePlayer from "@/components/reference-media/InlineReferencePlayer"
import { buttonStyles } from "@/components/ui/buttonStyles"
import { getReferencePracticeHref, type TuneMediaBundle } from "@/lib/tune-media"
import type { Piece } from "@/lib/types"

type CataloguePreviewProps = {
  piece: Piece
  mediaBundle?: TuneMediaBundle
  onClose: () => void
}

const compactDetails = [
  ["Type", "type"],
  ["Key", "key"],
  ["Style", "style"],
  ["Meter", "time_signature"],
] as const

/** Uses the already loaded page identity; opening a preview never fetches another collection. */
export default function CataloguePreview({
  piece,
  mediaBundle,
  onClose,
}: CataloguePreviewProps) {
  const heading = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    heading.current?.focus()
  }, [piece.id])

  return (
    <aside
      className="catalogue-preview workbench-context rounded-object border border-hairline bg-surface-paper p-4"
      aria-labelledby="catalogue-preview-title"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault()
          onClose()
        }
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <h2
          id="catalogue-preview-title"
          ref={heading}
          tabIndex={-1}
          className="min-w-0 scroll-mt-64 break-words font-serif text-2xl font-bold focus:outline-none md:scroll-mt-8"
        >
          {piece.title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className={`${buttonStyles.secondary} !w-auto shrink-0`}
          aria-label="Close tune preview"
        >
          Close
        </button>
      </div>

      <div className="mx-auto mt-3 w-full max-w-80">
        <InlineReferencePlayer
          key={piece.id}
          source={mediaBundle?.effectiveReference ?? null}
          fullHref={getReferencePracticeHref(
            piece.id,
            mediaBundle?.effectiveReference?.id
          )}
        />
      </div>

      <Link
        href={`/library/${piece.id}`}
        className={`${buttonStyles.primary} mt-3`}
      >
        Open Tune Detail
      </Link>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 rounded-control bg-surface-note p-3 text-sm">
        {compactDetails.map(([label, field]) => (
          <div key={field} className="min-w-0">
            <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
              {label}
            </dt>
            <dd className="mt-0.5 break-words font-semibold">
              {piece[field] || "Not recorded"}
            </dd>
          </div>
        ))}

        <div className="col-span-2 min-w-0 border-t border-hairline pt-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
            Source / composer
          </dt>
          <dd className="mt-0.5 break-words font-semibold">
            {piece.composer || "Not recorded"}
          </dd>
        </div>
      </dl>
    </aside>
  )
}
