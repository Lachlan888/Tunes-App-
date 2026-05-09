import Link from "next/link"
import EmptyState from "@/components/EmptyState"
import PieceSearchFilters from "@/components/library/PieceSearchFilters"
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
  includePractice: boolean
}

function buildCompareClearFiltersHref(
  filterPreservedUsers: string[],
  includePractice: boolean
) {
  const params = new URLSearchParams()

  for (const username of filterPreservedUsers) {
    if (username) {
      params.append("user", username)
    }
  }

  if (includePractice) {
    params.set("include_practice", "1")
  }

  return params.toString() ? `/compare?${params.toString()}` : "/compare"
}

function getPieceMeta(piece: Piece) {
  return [
    piece.key ? `Key: ${piece.key}` : null,
    piece.style ? `Style: ${piece.style}` : null,
    piece.time_signature ? `Time: ${piece.time_signature}` : null,
  ]
    .filter(Boolean)
    .join(" | ")
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
  includePractice,
}: CompareMutualPiecesSectionProps) {
  const emptyDescription = includePractice
    ? "You and this player or group do not currently have overlapping known or practice tunes."
    : "You and this player or group do not currently have overlapping known tunes."

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0">
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
          preservedParams={{
            user: filterPreservedUsers,
            ...(includePractice ? { include_practice: "1" } : {}),
          }}
        />
      </div>

      {filteredPieces.length === 0 ? (
        <div className="mt-3">
          {mutualPiecesCount > 0 ? (
            <EmptyState
              title="No common tunes match these filters"
              description="You may still have tunes in common. Clear the filters to see the full overlap."
              primaryActionHref={buildCompareClearFiltersHref(
                filterPreservedUsers,
                includePractice
              )}
              primaryActionLabel="Clear filters"
            />
          ) : (
            <EmptyState
              title="No common tunes yet"
              description={emptyDescription}
              secondaryActionHref="/friends"
              secondaryActionLabel="Find friends"
            />
          )}
        </div>
      ) : (
        <div className="mt-3 min-h-0 flex-1 overflow-hidden rounded-2xl border border-border bg-background/70">
          <ul className="h-full divide-y divide-border overflow-y-auto">
            {filteredPieces.map((piece) => {
              const href = `/library/${piece.id}`
              const meta = getPieceMeta(piece)

              return (
                <li key={piece.id}>
                  <Link
                    href={href}
                    className="group block px-4 py-3 transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                  >
                    <span className="block font-medium text-foreground underline-offset-4 group-hover:underline">
                      {piece.title}
                    </span>

                    {meta ? (
                      <span className="mt-1 block text-sm text-muted-foreground">
                        {meta}
                      </span>
                    ) : null}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}