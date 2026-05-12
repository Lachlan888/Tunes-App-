"use client"

import { useMemo, useState } from "react"
import ReferenceMediaEmbed, {
  getYouTubeVideoId,
} from "@/components/library/ReferenceMediaEmbed"

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
  const [isOpen, setIsOpen] = useState(false)

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
        Reference
      </a>
    )
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={className ?? "text-sm underline"}
        aria-expanded={isOpen}
      >
        {isOpen ? "Hide reference" : "Show reference"}
      </button>

      {isOpen ? (
        <div className="mt-3 -mx-1 sm:mx-0 sm:overflow-hidden sm:rounded-3xl sm:border sm:border-border sm:bg-card-strong/70 sm:p-4 sm:shadow-inner">
          <ReferenceMediaEmbed
            referenceUrl={referenceUrl}
            title={title}
            showHeading={false}
          />
        </div>
      ) : null}
    </div>
  )
}