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
  className = "mt-1 break-words text-xs font-medium leading-5 text-muted-foreground",
}: TuneMetadataSummaryProps) {
  const styleLabels = getStyleLabelsFromPiece({
    ...piece,
    piece_styles: piece.piece_styles ?? null,
  } as Piece)

  const metadataParts = [
    piece.key,
    styleLabels.length > 0 ? styleLabels.join(", ") : null,
    piece.time_signature,
  ].filter(Boolean)

  if (metadataParts.length === 0) return null

  return <p className={className}>{metadataParts.join(" · ")}</p>
}
