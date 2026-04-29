import EmptyState from "@/components/EmptyState"
import TuneCard from "@/components/TuneCard"
import PieceSearchFilters from "@/components/PieceSearchFilters"
import type { Piece } from "@/lib/types"

type CompareMutualPiecesSectionProps = {
  filteredPieces: Piece[]
  mutualPiecesCount: number
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

function buildCompareClearFiltersHref(filterPreservedUsers: string[]) {
  const params = new URLSearchParams()

  for (const username of filterPreservedUsers) {
    if (username) {
      params.append("user", username)
    }
  }

  return params.toString() ? `/compare?${params.toString()}` : "/compare"
}

export default function CompareMutualPiecesSection({
  filteredPieces,
  mutualPiecesCount,
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
        mutualPiecesCount > 0 ? (
          <EmptyState
            title="No common tunes match these filters"
            description="You may still have tunes in common. Clear the filters to see the full overlap."
            primaryActionHref={buildCompareClearFiltersHref(filterPreservedUsers)}
            primaryActionLabel="Clear filters"
          />
        ) : (
          <EmptyState
            title="No common tunes yet"
            description="You and this player or group do not currently have overlapping known or practice tunes."
            secondaryActionHref="/friends"
            secondaryActionLabel="Find friends"
          />
        )
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