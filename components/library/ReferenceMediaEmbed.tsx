import YouTubeLoopPlayer from "@/components/library/YouTubeLoopPlayer"

type ReferenceMediaEmbedProps = {
  referenceUrl: string
  title: string
  heading?: string
  showHeading?: boolean
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
  heading = "Reference video",
  showHeading = true,
}: ReferenceMediaEmbedProps) {
  const videoId = getYouTubeVideoId(referenceUrl)

  if (!videoId) {
    return null
  }

  return (
    <div>
      {showHeading ? (
        <h2 className="mb-3 text-xl font-semibold text-foreground">
          {heading}
        </h2>
      ) : null}

      <YouTubeLoopPlayer videoId={videoId} title={`${title} video`} />
    </div>
  )
}