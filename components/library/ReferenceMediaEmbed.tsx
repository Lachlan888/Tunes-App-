import ReferenceMediaModal from "@/components/library/ReferenceMediaModal"
import type { UserPieceMediaLoop } from "@/lib/loaders/tune-detail"

type ReferenceMediaEmbedProps = {
  referenceUrl: string
  title: string
  heading?: string
  showHeading?: boolean
  pieceId?: number
  redirectTo?: string
  savedLoops?: UserPieceMediaLoop[]
  triggerLabel?: string
  triggerClassName?: string
}

export function getYouTubeVideoId(referenceUrl: string): string | null {
  let url: URL

  try {
    url = new URL(referenceUrl)
  } catch {
    return null
  }

  const host = url.hostname.replace(/^www\./, "")

  if (host === "youtube.com" || host === "m.youtube.com") {
    if (url.pathname === "/watch") {
      return url.searchParams.get("v")
    }

    if (url.pathname.startsWith("/embed/")) {
      return url.pathname.split("/").filter(Boolean)[1] ?? null
    }

    if (url.pathname.startsWith("/shorts/")) {
      return url.pathname.split("/").filter(Boolean)[1] ?? null
    }
  }

  if (host === "youtu.be") {
    return url.pathname.split("/").filter(Boolean)[0] ?? null
  }

  return null
}

export function getYouTubeEmbedUrl(referenceUrl: string): string | null {
  const videoId = getYouTubeVideoId(referenceUrl)

  return videoId ? `https://www.youtube.com/embed/${videoId}` : null
}

export default function ReferenceMediaEmbed({
  referenceUrl,
  title,
  heading = "Reference video and loops",
  showHeading = true,
  pieceId,
  redirectTo,
  savedLoops = [],
  triggerLabel,
  triggerClassName,
}: ReferenceMediaEmbedProps) {
  const videoId = getYouTubeVideoId(referenceUrl)

  if (!videoId) {
    return null
  }

  const loopsForVideo = savedLoops.filter(
    (loop) => loop.youtube_video_id === videoId
  )

  return (
    <ReferenceMediaModal
      videoId={videoId}
      title={title}
      heading={heading}
      showHeading={showHeading}
      pieceId={pieceId}
      redirectTo={redirectTo}
      savedLoops={loopsForVideo}
      triggerLabel={triggerLabel}
      triggerClassName={triggerClassName}
    />
  )
}