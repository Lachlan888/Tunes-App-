"use client"

import { useMemo } from "react"
import ReferenceMediaEmbed from "@/components/library/ReferenceMediaEmbed"
import type { UserPieceMediaLoop } from "@/lib/loaders/tune-detail"
import { getYouTubeVideoId } from "@/lib/youtube"

type ReferenceMediaLinkProps = {
  referenceUrl: string
  title: string
  className?: string
  pieceId?: number
  redirectTo?: string
  savedLoops?: UserPieceMediaLoop[]
}

export default function ReferenceMediaLink({
  referenceUrl,
  title,
  className,
  pieceId,
  redirectTo,
  savedLoops,
}: ReferenceMediaLinkProps) {
  const videoId = useMemo(() => getYouTubeVideoId(referenceUrl), [referenceUrl])
  const isYouTube = Boolean(videoId)

  if (!referenceUrl) {
    return null
  }

  if (!isYouTube) {
    return (
      <a
        href={referenceUrl}
        target="_blank"
        rel="noreferrer"
        className={className ?? "text-sm underline"}
      >
        Open reference
      </a>
    )
  }

  return (
    <span className="block w-full">
      <ReferenceMediaEmbed
        referenceUrl={referenceUrl}
        title={title}
        showHeading={false}
        triggerLabel="Open reference"
        triggerClassName={className ?? "text-sm underline"}
        pieceId={pieceId}
        redirectTo={redirectTo}
        savedLoops={savedLoops}
      />
    </span>
  )
}
