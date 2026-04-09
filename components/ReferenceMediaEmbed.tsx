type ReferenceMediaEmbedProps = {
  referenceUrl: string
  title: string
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

export default function ReferenceMediaEmbed({
  referenceUrl,
  title,
}: ReferenceMediaEmbedProps) {
  const embedUrl = getYouTubeEmbedUrl(referenceUrl)

  if (!embedUrl) {
    return null
  }

  return (
    <section className="rounded border p-4">
      <h2 className="mb-3 text-xl font-semibold">Reference video</h2>

      <div className="aspect-video w-full overflow-hidden rounded border">
        <iframe
          src={embedUrl}
          title={`${title} reference video`}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    </section>
  )
}