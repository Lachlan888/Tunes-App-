import CompareMutualPiecesSection from "@/components/compare/CompareMutualPiecesSection"
import CompareResultsHeader from "@/components/compare/CompareResultsHeader"
import type { ProfileSearchRow } from "@/lib/profile-search"
import type { Piece } from "@/lib/types"

type CompareResultsPanelProps = {
  canShowResults: boolean
  compareHeading: string
  selectedProfiles: ProfileSearchRow[]
  mutualPieces: Piece[]
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
  includePractice: boolean
  isAcceptedFriend: boolean
}

export default function CompareResultsPanel({
  canShowResults,
  compareHeading,
  selectedProfiles,
  mutualPieces,
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
  includePractice,
  isAcceptedFriend,
}: CompareResultsPanelProps) {
  return (
    <aside className="min-w-0 lg:sticky lg:top-8 lg:h-full">
      <section className="flex h-full min-h-0 flex-col rounded-3xl border border-border bg-card p-5 shadow-sm">
        {canShowResults ? (
          <>
            <CompareResultsHeader
              compareHeading={compareHeading}
              selectedProfiles={selectedProfiles}
              mutualPiecesCount={mutualPieces.length}
              isAcceptedFriend={isAcceptedFriend}
            />

            <CompareMutualPiecesSection
              filteredPieces={filteredPieces}
              mutualPiecesCount={mutualPieces.length}
              titleQuery={titleQuery}
              selectedKeys={selectedKeys}
              selectedStyles={selectedStyles}
              selectedTimeSignatures={selectedTimeSignatures}
              availableKeys={availableKeys}
              availableStyles={availableStyles}
              availableTimeSignatures={availableTimeSignatures}
              hasActiveFilters={hasActiveFilters}
              filterPreservedUsers={filterPreservedUsers}
              includePractice={includePractice}
            />
          </>
        ) : (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Common tunes
            </h2>

            <p className="mt-3 text-sm text-muted-foreground md:text-base">
              Add one or more players on the left. Tunes shared by everyone in
              the group will appear here.
            </p>
          </div>
        )}
      </section>
    </aside>
  )
}