"use client"

import Link from "next/link"
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
  const remainingListCount = Math.max(listNames.length - visibleListNames.length, 0)

  const styleLabels = getStyleLabelsFromPiece({
    id,
    title,
    key: keyValue,
    style,
    time_signature: timeSignature,
    reference_url: referenceUrl,
    piece_styles: pieceStyles ?? null,
  })

  const styleText = styleLabels.length > 0 ? styleLabels.join(", ") : null

  return (
    <div className="rounded border p-3">
      <div>
        <Link href={`/library/${id}`} className="underline">
          {title}
        </Link>
        {keyValue ? `, key ${keyValue}` : ""}
        {styleText ? `, ${styleText}` : ""}
        {timeSignature ? `, ${timeSignature}` : ""}
      </div>

      {referenceUrl && (
        <p className="mt-1 text-sm">
          <a
            href={referenceUrl}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Reference
          </a>
        </p>
      )}

      {listNames.length > 0 && (
        <p className="mt-1 text-sm text-gray-600">
          In: {visibleListNames.join(", ")}
          {remainingListCount > 0 ? ` +${remainingListCount} more` : ""}
        </p>
      )}

      {children && <div className="mt-2 flex items-center gap-2">{children}</div>}
    </div>
  )
}