import { getStyleLabelsFromPiece } from "../search-filters.ts"
import type { PieceFilterOption } from "../types.ts"

export type TuneFilterDraft = {
  keys: string[]
  styles: string[]
  timeSignatures: string[]
}

export function pieceFilterOptionMatchesDraft(
  piece: PieceFilterOption,
  draft: TuneFilterDraft
) {
  const matchesKey =
    draft.keys.length === 0 ||
    (piece.key !== null && draft.keys.includes(piece.key))
  const styleLabels = getStyleLabelsFromPiece(piece)
  const matchesStyle =
    draft.styles.length === 0 ||
    draft.styles.some((style) => styleLabels.includes(style))
  const matchesTime =
    draft.timeSignatures.length === 0 ||
    (piece.time_signature !== null &&
      draft.timeSignatures.includes(piece.time_signature))

  return matchesKey && matchesStyle && matchesTime
}

export function countPieceFilterDraftMatches(
  pieces: PieceFilterOption[],
  draft: TuneFilterDraft
) {
  return pieces.filter((piece) => pieceFilterOptionMatchesDraft(piece, draft))
    .length
}

export function formatTuneResultsStatement(
  totalCount: number,
  activeFilterCount: number
) {
  const tuneLabel = `${totalCount} tune${totalCount === 1 ? "" : "s"}`

  if (activeFilterCount === 0) return `${tuneLabel} · No filters`

  return `${tuneLabel} · ${activeFilterCount} filter${
    activeFilterCount === 1 ? "" : "s"
  }`
}

export function describeTuneFilterConstraints({
  searchQuery,
  keys,
  styles,
  timeSignatures,
}: TuneFilterDraft & { searchQuery: string }) {
  return [
    searchQuery ? `Search: “${searchQuery}”` : null,
    ...keys.map((value) => `Key: ${value}`),
    ...styles.map((value) => `Style: ${value}`),
    ...timeSignatures.map((value) => `Time: ${value}`),
  ].filter((value): value is string => Boolean(value))
}
