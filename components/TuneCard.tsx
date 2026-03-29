"use client"

import type { Piece } from "@/lib/types"

type TuneCardProps = {
  title: Piece["title"]
  keyValue: Piece["key"]
  style: Piece["style"]
  timeSignature: Piece["time_signature"]
  referenceUrl?: Piece["reference_url"]
  listNames?: string[]
  children?: React.ReactNode
}

export default function TuneCard({
  title,
  keyValue,
  style,
  timeSignature,
  referenceUrl,
  listNames = [],
  children,
}: TuneCardProps) {
  const visibleListNames = listNames.slice(0, 3)
  const remainingListCount = Math.max(listNames.length - visibleListNames.length, 0)

  return (
    <div className="rounded border p-3">
      <div>
        {title}
        {keyValue ? `, key ${keyValue}` : ""}
        {style ? `, ${style}` : ""}
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