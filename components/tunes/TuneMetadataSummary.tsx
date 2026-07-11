import { getStyleLabelsFromPiece } from "@/lib/search-filters"
import type { Piece } from "@/lib/types"

type TuneMetadataSummaryProps = {
  piece: Pick<
    Piece,
    "id" | "title" | "key" | "style" | "time_signature" | "reference_url"
  > & {
    piece_styles?: Piece["piece_styles"]
  }
  className?: string
}

export default function TuneMetadataSummary({
  piece,
  className = "mt-2 break-words text-sm font-medium leading-6 text-muted-foreground",
}: TuneMetadataSummaryProps) {
  const styleLabels = getStyleLabelsFromPiece({
    ...piece,
    piece_styles: piece.piece_styles ?? null,
  } as Piece)

  const metadataParts = [
    piece.key ? `Key: ${piece.key}` : null,
    styleLabels.length > 0 ? `Style: ${styleLabels.join(", ")}` : null,
    piece.time_signature ? `Time: ${piece.time_signature}` : null,
  ].filter(Boolean)

  if (metadataParts.length === 0) return null

  return <p className={className}>{metadataParts.join(" | ")}</p>
}
