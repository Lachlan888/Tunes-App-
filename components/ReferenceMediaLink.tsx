"use client"

import { useMemo } from "react"
import ReferenceMediaEmbed from "@/components/library/ReferenceMediaEmbed"
import { getYouTubeVideoId } from "@/lib/youtube"

type ReferenceMediaLinkProps = {
  referenceUrl: string
  title: string
  className?: string
}

export default function ReferenceMediaLink({
  referenceUrl,
  title,
  className,
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
    <span className="inline-block">
      <ReferenceMediaEmbed
        referenceUrl={referenceUrl}
        title={title}
        showHeading={false}
        triggerLabel="Open reference"
        triggerClassName={className ?? "text-sm underline"}
      />
    </span>
  )
}