import CompareBlockedSection from "@/components/compare/CompareBlockedSection"
import CompareCandidateListSection from "@/components/compare/CompareCandidateListSection"
import CompareMutualPiecesSection from "@/components/compare/CompareMutualPiecesSection"
import ComparePageStatusMessages from "@/components/compare/ComparePageStatusMessages"
import CompareResultsHeader from "@/components/compare/CompareResultsHeader"
import CompareSearchForm from "@/components/compare/CompareSearchForm"
import CompareSuggestionsSection from "@/components/compare/CompareSuggestionsSection"
import CurrentCompareGroupSection from "@/components/compare/CurrentCompareGroupSection"
import type { CompareViewProps } from "@/components/compare/compare-view-types"

export default function CompareDesktop({
  selectedProfiles,
  filterPreservedUsers,
  titleQuery,
  selectedKeys,
  selectedStyles,
  selectedTimeSignatures,
  includePractice,
  friendRequestStatus,
  error,
  primarySearchValue,
  compareSuggestions,
  matchingProfiles,
  searchMatches,
  matchedProfile,
  isAcceptedFriend,
  canCompare,
  redirectTo,
  compareHeading,
  mutualPieces,
  filteredPieces,
  availableKeys,
  availableStyles,
  availableTimeSignatures,
  hasActiveFilters,
  canShowResults,
}: CompareViewProps) {
  return (
    <>
      <section className="mb-6 rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Compare Tunes
        </h1>

        <p className="mt-3 max-w-3xl text-base text-muted-foreground sm:text-lg">
          Build a group, then see the tunes common to everyone in it.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,520px)] lg:items-stretch">
        <section className="min-w-0">
          <CompareSearchForm
            initialQuery=""
            selectedUsers={filterPreservedUsers}
            includePractice={includePractice}
          />

          {filterPreservedUsers.length > 0 ? (
            <CurrentCompareGroupSection
              selectedProfiles={selectedProfiles}
              filterPreservedUsers={filterPreservedUsers}
              titleQuery={titleQuery}
              selectedKeys={selectedKeys}
              selectedStyles={selectedStyles}
              selectedTimeSignatures={selectedTimeSignatures}
              includePractice={includePractice}
            />
          ) : null}

          <ComparePageStatusMessages
            friendRequestStatus={friendRequestStatus}
            error={error}
            primarySearchValue={primarySearchValue}
          />

          <CompareSuggestionsSection
            compareSuggestions={compareSuggestions}
            filterPreservedUsers={filterPreservedUsers}
            includePractice={includePractice}
          />

          {error === "multiple_matches" ? (
            <CompareCandidateListSection
              title="Choose a user"
              description={`More than one user matched “${primarySearchValue}”.`}
              profiles={matchingProfiles}
              filterPreservedUsers={filterPreservedUsers}
              includePractice={includePractice}
              redirectTo={redirectTo}
            />
          ) : null}

          {error === null && searchMatches.length > 0 ? (
            <CompareCandidateListSection
              title="Choose a user"
              description="Select the person you want to add to this compare group."
              profiles={searchMatches}
              filterPreservedUsers={filterPreservedUsers}
              includePractice={includePractice}
              redirectTo={redirectTo}
            />
          ) : null}

          {matchedProfile && error === null && !canCompare ? (
            <CompareBlockedSection
              matchedProfile={matchedProfile}
              isAcceptedFriend={isAcceptedFriend}
              redirectTo={redirectTo}
            />
          ) : null}
        </section>

        <aside className="min-w-0 lg:sticky lg:top-8">
          <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
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
                  Add one or more players on the left. Tunes shared by everyone
                  in the group will appear here.
                </p>
              </div>
            )}
          </section>
        </aside>
      </div>
    </>
  )
}
