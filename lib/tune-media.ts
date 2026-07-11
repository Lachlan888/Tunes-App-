import type { SupabaseClient } from "@supabase/supabase-js"
import type { Piece, UserPieceMediaLoop } from "@/lib/types"
import { getYouTubeVideoId } from "@/lib/youtube"

export type TuneMediaSourceType =
  | "canonical-reference"
  | "personal-preferred-reference"
  | "additional-media"
  | "sheet-music"
  | "setlist-chart"

export type TuneMediaType =
  | "youtube"
  | "recording"
  | "video"
  | "lesson"
  | "sheet-music"
  | "source"
  | "performance"
  | "other"

export type TuneMediaSource = {
  id: string
  sourceType: TuneMediaSourceType
  mediaType: TuneMediaType
  label: string
  url: string
  isYouTube: boolean
  youtubeVideoId: string | null
  canBePreferredReference: boolean
  canUseSavedLoops: boolean
  notes?: string | null
  createdBy?: string | null
}

export type TuneMediaBundle = {
  pieceId: number
  canonicalReference: TuneMediaSource | null
  personalPreferredReference: TuneMediaSource | null
  effectiveReference: TuneMediaSource | null
  additionalMedia: TuneMediaSource[]
  sheetMusic: TuneMediaSource[]
  savedLoopsByVideoId: Record<string, UserPieceMediaLoop[]>
}

export type TuneMediaMetadataRow = {
  piece_id: number
  preferred_reference_url: string | null
  preferred_reference_label: string | null
}

export type TuneMediaLinkRow = {
  id: number
  piece_id: number
  url: string
  label: string | null
  media_type: string | null
  notes: string | null
  created_by: string | null
  created_at?: string | null
}

export type TuneSheetMusicRow = {
  id: number
  piece_id?: number
  url: string
  label: string | null
}

function normaliseMediaType(value: string | null | undefined): TuneMediaType {
  const normalised = (value ?? "").trim().toLowerCase()

  if (normalised === "recording") return "recording"
  if (normalised === "video") return "video"
  if (normalised === "lesson") return "lesson"
  if (normalised === "sheet music" || normalised === "sheet-music") {
    return "sheet-music"
  }
  if (normalised === "source") return "source"
  if (normalised === "performance") return "performance"
  if (normalised === "youtube") return "youtube"

  return "other"
}

function normaliseUrlForDedupe(value: string) {
  try {
    const url = new URL(value)
    url.hash = ""
    return url.toString().replace(/\/$/, "").toLowerCase()
  } catch {
    return value.trim().replace(/\/$/, "").toLowerCase()
  }
}

export function createTuneMediaSource({
  id,
  sourceType,
  mediaType,
  label,
  url,
  notes = null,
  createdBy = null,
}: {
  id: string
  sourceType: TuneMediaSourceType
  mediaType: TuneMediaType
  label: string
  url: string | null | undefined
  notes?: string | null
  createdBy?: string | null
}): TuneMediaSource | null {
  const cleanUrl = (url ?? "").trim()

  if (!cleanUrl) return null

  const youtubeVideoId = getYouTubeVideoId(cleanUrl)
  const isYouTube = Boolean(youtubeVideoId)

  return {
    id,
    sourceType,
    mediaType: isYouTube ? "youtube" : mediaType,
    label: label.trim() || "Untitled media",
    url: cleanUrl,
    isYouTube,
    youtubeVideoId,
    canBePreferredReference: isYouTube,
    canUseSavedLoops: isYouTube,
    notes,
    createdBy,
  }
}

export function groupLoopsByVideoId(loops: UserPieceMediaLoop[]) {
  const grouped: Record<string, UserPieceMediaLoop[]> = {}

  for (const loop of loops) {
    grouped[loop.youtube_video_id] = grouped[loop.youtube_video_id] ?? []
    grouped[loop.youtube_video_id].push(loop)
  }

  return grouped
}

export function getLoopsForSource(
  bundle: TuneMediaBundle,
  source: TuneMediaSource | null
) {
  if (!source?.youtubeVideoId) return []

  return bundle.savedLoopsByVideoId[source.youtubeVideoId] ?? []
}

export function buildTuneMediaBundle({
  piece,
  mediaLinks = [],
  sheetMusicLinks = [],
  metadata = null,
  mediaLoops = [],
}: {
  piece: Pick<Piece, "id" | "title" | "reference_url">
  mediaLinks?: TuneMediaLinkRow[]
  sheetMusicLinks?: TuneSheetMusicRow[]
  metadata?: TuneMediaMetadataRow | null
  mediaLoops?: UserPieceMediaLoop[]
}): TuneMediaBundle {
  const canonicalReference = createTuneMediaSource({
    id: `canonical-${piece.id}`,
    sourceType: "canonical-reference",
    mediaType: "youtube",
    label: "Shared reference",
    url: piece.reference_url,
  })

  const preferredReference =
    metadata?.preferred_reference_url &&
    getYouTubeVideoId(metadata.preferred_reference_url)
      ? createTuneMediaSource({
          id: `preferred-${piece.id}`,
          sourceType: "personal-preferred-reference",
          mediaType: "youtube",
          label: metadata.preferred_reference_label || "My preferred reference",
          url: metadata.preferred_reference_url,
        })
      : null

  const additionalMedia: TuneMediaSource[] = []
  const sheetMusic: TuneMediaSource[] = []
  const seenSheetMusicUrls = new Set<string>()

  for (const link of mediaLinks) {
    const mediaType = normaliseMediaType(link.media_type)
    const source = createTuneMediaSource({
      id: `media-${link.id}`,
      sourceType: mediaType === "sheet-music" ? "sheet-music" : "additional-media",
      mediaType,
      label: link.label || "Untitled media link",
      url: link.url,
      notes: link.notes,
      createdBy: link.created_by,
    })

    if (!source) continue

    if (mediaType === "sheet-music") {
      const dedupeKey = normaliseUrlForDedupe(source.url)
      if (!seenSheetMusicUrls.has(dedupeKey)) {
        sheetMusic.push(source)
        seenSheetMusicUrls.add(dedupeKey)
      }
    } else {
      additionalMedia.push(source)
    }
  }

  for (const link of sheetMusicLinks) {
    const source = createTuneMediaSource({
      id: `sheet-${link.id}`,
      sourceType: "sheet-music",
      mediaType: "sheet-music",
      label: link.label || "Sheet music",
      url: link.url,
    })

    if (!source) continue

    const dedupeKey = normaliseUrlForDedupe(source.url)
    if (!seenSheetMusicUrls.has(dedupeKey)) {
      sheetMusic.push(source)
      seenSheetMusicUrls.add(dedupeKey)
    }
  }

  return {
    pieceId: piece.id,
    canonicalReference,
    personalPreferredReference: preferredReference,
    effectiveReference: preferredReference || canonicalReference,
    additionalMedia,
    sheetMusic,
    savedLoopsByVideoId: groupLoopsByVideoId(mediaLoops),
  }
}

export async function loadTuneMediaBundles({
  supabase,
  pieces,
  userId,
}: {
  supabase: SupabaseClient
  pieces: Array<Pick<Piece, "id" | "title" | "reference_url">>
  userId?: string | null
}): Promise<Map<number, TuneMediaBundle>> {
  const pieceIds = Array.from(new Set(pieces.map((piece) => piece.id)))
  const piecesById = new Map(pieces.map((piece) => [piece.id, piece]))
  const bundles = new Map<number, TuneMediaBundle>()

  if (pieceIds.length === 0) {
    return bundles
  }

  const [
    mediaLinksResult,
    sheetMusicResult,
    metadataResult,
    loopsResult,
  ] = await Promise.all([
    supabase
      .from("piece_media_links")
      .select("id, piece_id, url, label, media_type, notes, created_by, created_at")
      .in("piece_id", pieceIds)
      .order("created_at", { ascending: true }),

    supabase
      .from("piece_sheet_music_links")
      .select("id, piece_id, url, label")
      .in("piece_id", pieceIds)
      .order("created_at", { ascending: true }),

    userId
      ? supabase
          .from("user_piece_metadata")
          .select("piece_id, preferred_reference_url, preferred_reference_label")
          .eq("user_id", userId)
          .in("piece_id", pieceIds)
      : Promise.resolve({ data: [], error: null }),

    userId
      ? supabase
          .from("user_piece_media_loops")
          .select(
            "id, piece_id, youtube_video_id, label, start_seconds, end_seconds, playback_rate, notes, created_at, updated_at"
          )
          .eq("user_id", userId)
          .in("piece_id", pieceIds)
          .order("created_at", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
  ])

  for (const result of [
    mediaLinksResult,
    sheetMusicResult,
    metadataResult,
    loopsResult,
  ]) {
    if (result.error) {
      throw new Error(result.error.message)
    }
  }

  const mediaLinksByPieceId = new Map<number, TuneMediaLinkRow[]>()
  for (const link of (mediaLinksResult.data ?? []) as TuneMediaLinkRow[]) {
    const rows = mediaLinksByPieceId.get(link.piece_id) ?? []
    rows.push(link)
    mediaLinksByPieceId.set(link.piece_id, rows)
  }

  const sheetMusicByPieceId = new Map<number, TuneSheetMusicRow[]>()
  for (const link of (sheetMusicResult.data ?? []) as TuneSheetMusicRow[]) {
    if (!link.piece_id) continue
    const rows = sheetMusicByPieceId.get(link.piece_id) ?? []
    rows.push(link)
    sheetMusicByPieceId.set(link.piece_id, rows)
  }

  const metadataByPieceId = new Map<number, TuneMediaMetadataRow>()
  for (const metadata of (metadataResult.data ?? []) as TuneMediaMetadataRow[]) {
    metadataByPieceId.set(metadata.piece_id, metadata)
  }

  const loopsByPieceId = new Map<number, UserPieceMediaLoop[]>()
  for (const loop of (loopsResult.data ?? []) as UserPieceMediaLoop[]) {
    const rows = loopsByPieceId.get(loop.piece_id) ?? []
    rows.push(loop)
    loopsByPieceId.set(loop.piece_id, rows)
  }

  for (const pieceId of pieceIds) {
    const piece = piecesById.get(pieceId)
    if (!piece) continue

    bundles.set(
      pieceId,
      buildTuneMediaBundle({
        piece,
        mediaLinks: mediaLinksByPieceId.get(pieceId) ?? [],
        sheetMusicLinks: sheetMusicByPieceId.get(pieceId) ?? [],
        metadata: metadataByPieceId.get(pieceId) ?? null,
        mediaLoops: loopsByPieceId.get(pieceId) ?? [],
      })
    )
  }

  return bundles
}

export async function loadTuneMediaBundle({
  supabase,
  piece,
  userId,
}: {
  supabase: SupabaseClient
  piece: Pick<Piece, "id" | "title" | "reference_url">
  userId?: string | null
}) {
  const bundles = await loadTuneMediaBundles({
    supabase,
    pieces: [piece],
    userId,
  })

  return bundles.get(piece.id) ?? buildTuneMediaBundle({ piece })
}
