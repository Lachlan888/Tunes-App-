import TuneCard from "@/components/TuneCard"
import PieceSearchFilters from "@/components/PieceSearchFilters"
import type { Piece } from "@/lib/types"

type CompareMutualPiecesSectionProps = {
  filteredPieces: Piece[]
  titleQuery: string
  selectedKeys: string[]
  selectedStyles: string[]
  selectedTimeSignatures: string[]
  availableKeys: string[]
  availableStyles: string[]
  availableTimeSignatures: string[]
  hasActiveFilters: boolean
  filterPreservedUsers: string[]
}

export default function CompareMutualPiecesSection({
  filteredPieces,
  titleQuery,
  selectedKeys,
  selectedStyles,
  selectedTimeSignatures,
  availableKeys,
  availableStyles,
  availableTimeSignatures,
  hasActiveFilters,
  filterPreservedUsers,
}: CompareMutualPiecesSectionProps) {
  return (
    <>
      <PieceSearchFilters
        basePath="/compare"
        searchLabel="Search by title"
        searchPlaceholder="Search mutual tunes"
        searchValue={titleQuery}
        selectedKeys={selectedKeys}
        selectedStyles={selectedStyles}
        selectedTimeSignatures={selectedTimeSignatures}
        availableKeys={availableKeys}
        availableStyles={availableStyles}
        availableTimeSignatures={availableTimeSignatures}
        hasActiveFilters={hasActiveFilters}
        preservedParams={{ user: filterPreservedUsers }}
      />

      {filteredPieces.length === 0 ? (
        <p>No mutual tunes match this filter.</p>
      ) : (
        <div className="space-y-3">
          {filteredPieces.map((piece) => (
            <TuneCard
              key={piece.id}
              id={piece.id}
              title={piece.title}
              keyValue={piece.key}
              style={piece.style}
              pieceStyles={piece.piece_styles}
              timeSignature={piece.time_signature}
              referenceUrl={piece.reference_url}
              listNames={[]}
            />
          ))}
        </div>
      )}
    </>
  )
}