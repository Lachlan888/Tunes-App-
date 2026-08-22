export type ReferenceMediaIdentity = {
  id: string
  url: string
}

function normaliseUrl(value: string) {
  try {
    const url = new URL(value)
    url.hash = ""
    return url.toString().replace(/\/$/, "").toLowerCase()
  } catch {
    return value.trim().replace(/\/$/, "").toLowerCase()
  }
}

export function listReferenceMediaSources<T extends ReferenceMediaIdentity>({
  canonical,
  additional,
  preferred,
}: {
  canonical: T | null
  additional: T[]
  preferred: T | null
}) {
  const sources: T[] = []
  const seenUrls = new Set<string>()

  for (const source of [canonical, ...additional, preferred]) {
    if (!source) continue

    const dedupeKey = normaliseUrl(source.url)
    if (seenUrls.has(dedupeKey)) continue

    sources.push(source)
    seenUrls.add(dedupeKey)
  }

  return sources
}

export function chooseReferenceMediaSource<T extends ReferenceMediaIdentity>({
  sources,
  requestedSourceId,
  effectiveUrl,
}: {
  sources: T[]
  requestedSourceId?: string | null
  effectiveUrl?: string | null
}) {
  if (requestedSourceId) {
    const requestedSource = sources.find(
      (source) => source.id === requestedSourceId
    )
    if (requestedSource) return requestedSource
  }

  if (effectiveUrl) {
    const effectiveSource = sources.find(
      (source) => normaliseUrl(source.url) === normaliseUrl(effectiveUrl)
    )
    if (effectiveSource) return effectiveSource
  }

  return sources[0] ?? null
}

export function groupReferenceSectionsByMediaId<
  T extends { youtube_video_id: string },
>(sections: T[]) {
  const grouped: Record<string, T[]> = {}

  for (const section of sections) {
    grouped[section.youtube_video_id] =
      grouped[section.youtube_video_id] ?? []
    grouped[section.youtube_video_id].push(section)
  }

  return grouped
}

export function getReferencePracticeHref(
  pieceId: number,
  sourceId?: string | null
) {
  const pathname = `/library/${pieceId}/reference-media`

  return sourceId
    ? `${pathname}?media=${encodeURIComponent(sourceId)}`
    : pathname
}
