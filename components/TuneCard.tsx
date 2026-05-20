"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import ReferenceMediaLink from "@/components/ReferenceMediaLink"
import ClickableCard from "@/components/ui/ClickableCard"
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
  topRightAction?: ReactNode
  children?: ReactNode
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
  topRightAction,
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
    <ClickableCard
      href={`/library/${id}`}
      ariaLabel={`Open tune page for ${title}`}
      as="article"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-serif text-2xl font-bold leading-tight tracking-tight text-foreground">
            <Link
              href={`/library/${id}`}
              className="decoration-primary decoration-2 underline-offset-4 hover:underline"
            >
              {title}
            </Link>
          </h3>

          {metadataParts.length > 0 && (
            <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
              {metadataParts.join(" | ")}
            </p>
          )}
        </div>

        {topRightAction ? (
          <div data-card-action className="flex flex-shrink-0 items-start">
            {topRightAction}
          </div>
        ) : null}
      </div>

      {referenceUrl && (
        <div data-card-action className="mt-4">
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
        <div
          data-card-action
          className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-3"
        >
          {children}
        </div>
      )}
    </ClickableCard>
  )
}