"use client"

import { useMemo, useState } from "react"

type ReferenceMediaLinkProps = {
  referenceUrl: string
  title: string
  className?: string
}

function getYouTubeEmbedUrl(referenceUrl: string): string | null {
  let url: URL

  try {
    url = new URL(referenceUrl)
  } catch {
    return null
  }

  const host = url.hostname.replace(/^www\./, "")

  if (host === "youtube.com" || host === "m.youtube.com") {
    if (url.pathname === "/watch") {
      const videoId = url.searchParams.get("v")
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null
    }

    if (url.pathname.startsWith("/embed/")) {
      const videoId = url.pathname.split("/embed/")[1]
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null
    }

    if (url.pathname.startsWith("/shorts/")) {
      const videoId = url.pathname.split("/shorts/")[1]
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null
    }
  }

  if (host === "youtu.be") {
    const videoId = url.pathname.replace(/^\/+/, "")
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null
  }

  return null
}

export default function ReferenceMediaLink({
  referenceUrl,
  title,
  className,
}: ReferenceMediaLinkProps) {
  const [isOpen, setIsOpen] = useState(false)

  const embedUrl = useMemo(() => getYouTubeEmbedUrl(referenceUrl), [referenceUrl])
  const isYouTube = Boolean(embedUrl)

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
      >
        {isOpen ? "Hide reference" : "Reference"}
      </button>

      {isOpen && embedUrl && (
        <div className="mt-3 overflow-hidden rounded border">
          <div className="aspect-video w-full">
            <iframe
              src={embedUrl}
              title={`${title} reference video`}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  )
}