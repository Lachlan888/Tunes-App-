"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import PreferredReferenceControl from "@/components/reference-media/PreferredReferenceControl"
import ClickableCard from "@/components/ui/ClickableCard"
import type { PreferredReferenceMetadata } from "@/lib/effective-reference"
import { getStyleLabelsFromPiece } from "@/lib/search-filters"
import type { Piece, UserPieceMediaLoop } from "@/lib/types"

export type TuneCardListLink = {
  id: number | string
  name: string
  href: string
}

type TuneCardProps = {
  id: Piece["id"]
  title: Piece["title"]
  keyValue: Piece["key"]
  style: Piece["style"]
  timeSignature: Piece["time_signature"]
  referenceUrl?: Piece["reference_url"]
  referenceMetadata?: PreferredReferenceMetadata
  pieceStyles?: Piece["piece_styles"]
  listNames?: string[]
  listLinks?: TuneCardListLink[]
  redirectTo?: string
  savedLoops?: UserPieceMediaLoop[]
  upsertPreferredReferenceUrl?: (formData: FormData) => Promise<void>
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
  referenceMetadata,
  pieceStyles,
  listNames = [],
  listLinks = [],
  redirectTo,
  savedLoops,
  upsertPreferredReferenceUrl,
  topRightAction,
  children,
}: TuneCardProps) {
  const fallbackListLinks = listNames.map((name, index) => ({
    id: `fallback-${index}-${name}`,
    name,
    href: "",
  }))

  const allListLinks = listLinks.length > 0 ? listLinks : fallbackListLinks
  const visibleListLinks = allListLinks.slice(0, 3)
  const remainingListCount = Math.max(
    allListLinks.length - visibleListLinks.length,
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
          <h3 className="break-words font-serif text-2xl font-bold leading-tight tracking-tight text-foreground">
            <Link
              href={`/library/${id}`}
              className="decoration-primary decoration-2 underline-offset-4 hover:underline"
            >
              {title}
            </Link>
          </h3>

          {metadataParts.length > 0 && (
            <p className="mt-2 break-words text-sm font-medium leading-6 text-muted-foreground">
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

      {referenceUrl ? (
        <div data-card-action className="mt-4">
          <PreferredReferenceControl
            pieceId={id}
            title={title}
            defaultReferenceUrl={referenceUrl}
            metadata={referenceMetadata}
            redirectTo={redirectTo ?? `/library/${id}`}
            upsertPreferredReferenceUrl={upsertPreferredReferenceUrl}
            savedLoops={savedLoops}
            compact
            openLabel="Open reference video"
            showPickerTrigger={false}
            triggerClassName="text-sm font-medium text-muted-foreground underline underline-offset-4 transition hover:text-foreground"
          />
        </div>
      ) : null}

      {allListLinks.length > 0 && (
        <p
          data-card-action
          className="mt-3 text-sm leading-6 text-muted-foreground"
        >
          <span>In: </span>

          {visibleListLinks.map((list, index) => (
            <span key={list.id}>
              {index > 0 ? <span>, </span> : null}

              {list.href ? (
                <Link
                  href={list.href}
                  className="font-medium underline underline-offset-4 transition hover:text-foreground"
                >
                  {list.name}
                </Link>
              ) : (
                <span>{list.name}</span>
              )}
            </span>
          ))}

          {remainingListCount > 0 ? (
            <span> +{remainingListCount} more</span>
          ) : null}
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
