"use client"

import PendingLinkButton from "@/components/PendingLinkButton"
import ReferenceMediaLink from "@/components/ReferenceMediaLink"
import { getStyleLabelsFromPiece } from "@/lib/search-filters"
import type { Piece } from "@/lib/types"

type TuneCardProps = {
  id: Piece["id"]
  title: Piece["title"]
  keyValue: Piece["key"]
  style: Piece["style"]
  timeSignature: Piece["time_signature"]
  referenceUrl?: Piece["reference_url"]
  pieceStyles?: Piece["piece_styles"]
  listNames?: string[]
  children?: React.ReactNode
}

export default function TuneCard({
  id,
  title,
  keyValue,
  style,
  timeSignature,
  referenceUrl,
  pieceStyles,
  listNames = [],
  children,
}: TuneCardProps) {
  const visibleListNames = listNames.slice(0, 3)
  const remainingListCount = Math.max(
    listNames.length - visibleListNames.length,
    0
  )

  const styleLabels = getStyleLabelsFromPiece({
    id,
    title,
    key: keyValue,
    style,
    time_signature: timeSignature,
    reference_url: referenceUrl,
    piece_styles: pieceStyles ?? null,
  })

  const metadataParts = [
    keyValue ? `Key: ${keyValue}` : null,
    styleLabels.length > 0 ? `Style: ${styleLabels.join(", ")}` : null,
    timeSignature ? `Time: ${timeSignature}` : null,
  ].filter(Boolean)

  return (
    <article className="rounded-2xl border border-border bg-background/70 p-5 shadow-sm transition hover:bg-muted/70">
      <div className="min-w-0">
        <h3 className="font-serif text-2xl font-bold leading-tight tracking-tight text-foreground">
          <PendingLinkButton
            href={`/library/${id}`}
            label={title}
            pendingLabel="Loading..."
            className="decoration-primary decoration-2 underline-offset-4 hover:underline"
          />
        </h3>

        {metadataParts.length > 0 && (
          <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
            {metadataParts.join(" | ")}
          </p>
        )}
      </div>

      {referenceUrl && (
        <div className="mt-4">
          <ReferenceMediaLink
            referenceUrl={referenceUrl}
            title={title}
            className="text-sm font-medium text-muted-foreground underline underline-offset-4 transition hover:text-foreground"
          />
        </div>
      )}

      {listNames.length > 0 && (
        <p className="mt-3 text-sm text-muted-foreground">
          In: {visibleListNames.join(", ")}
          {remainingListCount > 0 ? ` +${remainingListCount} more` : ""}
        </p>
      )}

      {children && (
        <div className="mt-5 flex flex-wrap items-center gap-3">{children}</div>
      )}
    </article>
  )
}