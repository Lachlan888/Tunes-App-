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

export function getCanonicalYouTubeWatchUrl(videoId: string) {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`
}

export function isYouTubeUrl(value: string) {
  return Boolean(getYouTubeVideoId(value))
}