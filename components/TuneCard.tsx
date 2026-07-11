"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import TuneMediaLauncher from "@/components/reference-media/TuneMediaLauncher"
import TuneIdentity from "@/components/tunes/TuneIdentity"
import TuneMetadataSummary from "@/components/tunes/TuneMetadataSummary"
import ClickableCard from "@/components/ui/ClickableCard"
import type { TuneMediaBundle } from "@/lib/tune-media"
import type { Piece } from "@/lib/types"

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
  mediaBundle?: TuneMediaBundle | null
  pieceStyles?: Piece["piece_styles"]
  listNames?: string[]
  listLinks?: TuneCardListLink[]
  redirectTo?: string
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
  mediaBundle,
  pieceStyles,
  listNames = [],
  listLinks = [],
  redirectTo,
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

  return (
    <ClickableCard
      href={`/library/${id}`}
      ariaLabel={`Open tune page for ${title}`}
      as="article"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <TuneIdentity id={id} title={title} />

          <TuneMetadataSummary
            piece={{
              id,
              title,
              key: keyValue,
              style,
              time_signature: timeSignature,
              reference_url: referenceUrl ?? null,
              piece_styles: pieceStyles ?? null,
            }}
          />
        </div>

        {topRightAction ? (
          <div data-card-action className="flex flex-shrink-0 items-start">
            {topRightAction}
          </div>
        ) : null}
      </div>

      {mediaBundle?.effectiveReference ? (
        <div data-card-action className="mt-4">
          <TuneMediaLauncher
            pieceId={id}
            title={title}
            mediaBundle={mediaBundle}
            redirectTo={redirectTo ?? `/library/${id}`}
            label="Open Reference Media"
            className="text-sm font-medium text-muted-foreground underline underline-offset-4 transition hover:text-foreground"
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
