import type { TuneMediaSource } from "@/lib/tune-media"

export function getReferenceSourceCapabilities(
  source: TuneMediaSource | null,
  currentUserId: string
) {
  if (!source) return { externalHref: null, removableMediaId: null }

  let externalHref: string | null = null
  try {
    const url = new URL(source.url)
    if (url.protocol === "http:" || url.protocol === "https:") {
      externalHref = source.url
    }
  } catch {
    // Invalid URLs have no external action.
  }

  const mediaId = /^media-(\d+)$/.exec(source.id)?.[1]
  const removableMediaId = source.sourceType === "additional-media" &&
    source.createdBy === currentUserId && mediaId
    ? Number(mediaId)
    : null

  return { externalHref, removableMediaId }
}
