import type { ReactNode } from "react"
import TuneIdentity from "@/components/tunes/TuneIdentity"
import { getPrimaryStyleLabel } from "@/lib/search-filters"
import type { TuneCollectionIdentity } from "@/lib/tune-collections/adapters"

type TuneRowProps = {
  piece: TuneCollectionIdentity
  sourceSummary?: string | null
  personalState?: ReactNode
  actions?: ReactNode
  supportingContent?: ReactNode
  className?: string
}

export default function TuneRow({
  piece,
  sourceSummary,
  personalState,
  actions,
  supportingContent,
  className = "",
}: TuneRowProps) {
  const provenance =
    sourceSummary ??
    (piece.composer ? `Source / composer: ${piece.composer}` : null)

  return (
    <article
      className={`grid gap-3 py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-6 ${className}`}
    >
      <div className="min-w-0">
        <TuneIdentity
          id={piece.id}
          title={piece.title}
          alternateTitles={piece.alternate_titles}
          tuneType={piece.type}
          style={getPrimaryStyleLabel(piece)}
          tuneKey={piece.key}
          timeSignature={piece.time_signature}
          sourceSummary={provenance}
          personalState={personalState}
          headingClassName="break-words text-base font-semibold leading-tight text-text-primary md:text-lg"
          linkClassName="rounded-sm decoration-action-primary decoration-2 underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
        />

        {supportingContent ? (
          <div className="mt-2 text-sm text-text-muted">{supportingContent}</div>
        ) : null}
      </div>

      {actions ? (
        <div
          className="flex flex-wrap items-center gap-2 md:justify-end"
          aria-label={`Actions for ${piece.title}`}
        >
          {actions}
        </div>
      ) : null}
    </article>
  )
}
