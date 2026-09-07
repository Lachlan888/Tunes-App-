export const MAX_CATALOGUE_SELECTION = 50

export function toggleCatalogueSelection(
  selectedPieceIds: number[],
  pieceId: number,
  maximum = MAX_CATALOGUE_SELECTION
) {
  if (selectedPieceIds.includes(pieceId)) {
    return selectedPieceIds.filter((candidate) => candidate !== pieceId)
  }

  if (selectedPieceIds.length >= maximum) return selectedPieceIds

  return [...selectedPieceIds, pieceId]
}

export function parseStoredCatalogueSelection(value: string | null) {
  if (!value) return []

  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) return []

    return Array.from(
      new Set(
        parsed
          .map((item) => Number(item))
          .filter((item) => Number.isInteger(item) && item > 0)
      )
    ).slice(0, MAX_CATALOGUE_SELECTION)
  } catch {
    return []
  }
}
