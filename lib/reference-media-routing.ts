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

/** Only known internal destinations can be used to return from the workspace. */
export function safeReferenceReturn(value?: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\r\n]/.test(value)) return null
  try {
    const url = new URL(value, "https://tunes.invalid")
    if (url.origin !== "https://tunes.invalid" || !/^\/(review|library)(\/\d+)?$/.test(url.pathname)) return null
    if (url.searchParams.get("view") === "reference") return null
    return `${url.pathname}${url.search}${url.hash}`
  } catch { return null }
}

export function getReferencePracticeHref(pieceId: number, sourceId?: string | null, returnTo?: string | null) {
  const params = new URLSearchParams()
  if (sourceId) params.set("media", sourceId)
  const safeReturn = safeReferenceReturn(returnTo)
  if (safeReturn) params.set("return_to", safeReturn)
  return `/library/${pieceId}/reference-media${params.size ? `?${params}` : ""}`
}
