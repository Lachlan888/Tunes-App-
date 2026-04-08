import { normaliseTuneTitle } from "@/lib/normalise"
import type { Piece } from "@/lib/types"

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