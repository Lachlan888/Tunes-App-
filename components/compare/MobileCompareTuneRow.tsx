import Link from "next/link"
import { getPrimaryStyleLabel } from "@/lib/search-filters"
import type { Piece } from "@/lib/types"

type MobileCompareTuneRowProps = {
  piece: Piece
}

function getPieceMeta(piece: Piece) {
  return [piece.key, getPrimaryStyleLabel(piece), piece.time_signature].filter(
    Boolean
  )
}

export default function MobileCompareTuneRow({
  piece,
}: MobileCompareTuneRowProps) {
  const meta = getPieceMeta(piece)

  return (
    <Link
      href={`/library/${piece.id}`}
      className="block py-3 transition hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
    >
      <span className="block text-sm font-medium text-foreground">
        {piece.title}
      </span>

      {meta.length > 0 ? (
        <span className="mt-1 block text-xs text-muted-foreground">
          {meta.join(" · ")}
        </span>
      ) : null}
    </Link>
  )
}