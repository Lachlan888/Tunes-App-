import { normaliseTuneTitle } from "@/lib/normalise"
import type { FilterableLearningList, Piece } from "@/lib/types"

export type PieceSearchFilters = {
  q: string
  keys: string[]
  styles: string[]
  timeSignatures: string[]
}

export type PieceFilterOptions = {
  keys: string[]
  styles: string[]
  timeSignatures: string[]
}

export type ListSearchFilters = {
  q: string
  size: string
  styles: string[]
  source: string
  visibility: string
}

export type ListFilterOptions = {
  styles: string[]
}

export function normaliseForSearch(value: string | null | undefined) {
  return normaliseTuneTitle(value)
}

export function getStyleLabelsFromPiece(piece: Piece): string[] {
  const labelsFromJoin = (piece.piece_styles ?? [])
    .flatMap((pieceStyle) => {
      if (!pieceStyle.styles) return []

      return Array.isArray(pieceStyle.styles)
        ? pieceStyle.styles.map((style) => style.label)
        : [pieceStyle.styles.label]
    })
    .filter((label): label is string => Boolean(label))

  if (labelsFromJoin.length > 0) {
    return Array.from(new Set(labelsFromJoin))
  }

  return piece.style ? [piece.style] : []
}

export function getPrimaryStyleLabel(piece: Piece): string | null {
  const labels = getStyleLabelsFromPiece(piece)
  return labels[0] ?? null
}

export function getPieceFilterOptions(pieces: Piece[]): PieceFilterOptions {
  const keys = Array.from(
    new Set(
      pieces.map((piece) => piece.key).filter((key): key is string => Boolean(key))
    )
  ).sort()

  const styles = Array.from(
    new Set(pieces.flatMap((piece) => getStyleLabelsFromPiece(piece)))
  ).sort()

  const timeSignatures = Array.from(
    new Set(
      pieces
        .map((piece) => piece.time_signature)
        .filter((timeSignature): timeSignature is string => Boolean(timeSignature))
    )
  ).sort()

  return {
    keys,
    styles,
    timeSignatures,
  }
}

export function pieceMatchesFilters(piece: Piece, filters: PieceSearchFilters) {
  const hasSearch = filters.q.trim() !== ""

  const matchesSearch =
    !hasSearch ||
    normaliseForSearch(piece.title).includes(normaliseForSearch(filters.q))

  const matchesKey =
    filters.keys.length === 0 ||
    (piece.key !== null && filters.keys.includes(piece.key))

  const pieceStyleLabels = getStyleLabelsFromPiece(piece)

  const matchesStyle =
    filters.styles.length === 0 ||
    filters.styles.some((selectedStyle) => pieceStyleLabels.includes(selectedStyle))

  const matchesTimeSignature =
    filters.timeSignatures.length === 0 ||
    (piece.time_signature !== null &&
      filters.timeSignatures.includes(piece.time_signature))

  return matchesSearch && matchesKey && matchesStyle && matchesTimeSignature
}

export function getListSizeBucketFromTuneCount(tuneCount: number) {
  if (tuneCount >= 1 && tuneCount <= 10) return "1-10"
  if (tuneCount >= 11 && tuneCount <= 25) return "11-25"
  if (tuneCount >= 26 && tuneCount <= 50) return "26-50"
  return "51-plus"
}

export function getListFilterOptions(
  lists: FilterableLearningList[]
): ListFilterOptions {
  const styles = Array.from(
    new Set(lists.flatMap((list) => list.stylesPresent))
  ).sort()

  return {
    styles,
  }
}

export function listMatchesFilters(
  list: FilterableLearningList,
  filters: ListSearchFilters
) {
  const hasSearch = filters.q.trim() !== ""

  const matchesSearch =
    !hasSearch ||
    normaliseForSearch(list.name).includes(normaliseForSearch(filters.q))

  const matchesSize =
    filters.size === "" ||
    getListSizeBucketFromTuneCount(list.tuneCount) === filters.size

  const matchesStyle =
    filters.styles.length === 0 ||
    filters.styles.some((selectedStyle) => list.stylesPresent.includes(selectedStyle))

  const matchesSource =
    filters.source === "" || list.source === filters.source

  const matchesVisibility =
    filters.visibility === "" || list.visibility === filters.visibility

  return (
    matchesSearch &&
    matchesSize &&
    matchesStyle &&
    matchesSource &&
    matchesVisibility
  )
}