import CompareBlockedSection from "@/components/compare/CompareBlockedSection"
import CompareCandidateListSection from "@/components/compare/CompareCandidateListSection"
import CompareMutualPiecesSection from "@/components/compare/CompareMutualPiecesSection"
import ComparePageStatusMessages from "@/components/compare/ComparePageStatusMessages"
import CompareResultsHeader from "@/components/compare/CompareResultsHeader"
import CompareSearchForm from "@/components/compare/CompareSearchForm"
import CompareSuggestionsSection from "@/components/compare/CompareSuggestionsSection"
import CurrentCompareGroupSection from "@/components/compare/CurrentCompareGroupSection"
import {
  getPieceFilterOptions,
  pieceMatchesFilters,
} from "@/lib/search-filters"
import {
  buildCompareHref,
  getIncludePracticeFromParam,
  toArray,
} from "@/lib/compare-page"
import { loadCompareData } from "@/lib/loaders/compare"
import type { Piece } from "@/lib/types"

type ComparePageProps = {
  searchParams?: Promise<{
    user?: string | string[]
    q?: string | string[]
    key?: string | string[]
    style?: string | string[]
    time_signature?: string | string[]
    include_practice?: string | string[]
    friend_request?: string
  }>
}

export default async function ComparePage({
  searchParams,
}: ComparePageProps) {
  const resolvedSearchParams = await searchParams

  const selectedUsers = toArray(resolvedSearchParams?.user)
  const primarySearchValue = selectedUsers[selectedUsers.length - 1] ?? ""

  const titleQuery = Array.isArray(resolvedSearchParams?.q)
    ? resolvedSearchParams?.q[0] ?? ""
    : resolvedSearchParams?.q ?? ""

  const includePractice = getIncludePracticeFromParam(
    resolvedSearchParams?.include_practice
  )

  const friendRequestStatus = resolvedSearchParams?.friend_request ?? ""

  const selectedKeys = toArray(resolvedSearchParams?.key)
  const selectedStyles = toArray(resolvedSearchParams?.style)
  const selectedTimeSignatures = toArray(resolvedSearchParams?.time_signature)

  const {
    matchedProfile,
    matchingProfiles,
    searchMatches,
    mutualPieces,
    compareSuggestions,
    isAcceptedFriend,
    canCompare,
    error,
    selectedProfiles,
  } = await loadCompareData(selectedUsers, { includePractice })

  const {
    keys: availableKeys,
    styles: availableStyles,
    timeSignatures: availableTimeSignatures,
  } = getPieceFilterOptions(mutualPieces)

  const filteredPieces = mutualPieces.filter((piece: Piece) =>
    pieceMatchesFilters(piece, {
      q: titleQuery,
      keys: selectedKeys,
      styles: selectedStyles,
      timeSignatures: selectedTimeSignatures,
    })
  )

  const hasActiveFilters =
    titleQuery !== "" ||
    selectedKeys.length > 0 ||
    selectedStyles.length > 0 ||
    selectedTimeSignatures.length > 0

  const redirectTo = buildCompareHref(selectedUsers, { includePractice })

  const unresolvedUsers =
    error === "multiple_matches" ||
    error === "user_not_found" ||
    error === "self_compare"
      ? [primarySearchValue]
      : []

  const stableSelectedUsernames = [
    ...selectedProfiles
      .map((profile) => profile.username)
      .filter((username): username is string => Boolean(username)),
    ...unresolvedUsers.filter(Boolean),
  ]

  const compareSummaryNames = selectedProfiles.map(
    (profile) => profile.display_name || profile.username
  )

  const compareHeading =
    compareSummaryNames.length === 0
      ? "Common tunes"
      : compareSummaryNames.length === 1
        ? `In common with ${compareSummaryNames[0]}`
        : `Common to your group (${compareSummaryNames.length + 1} players including you)`

  const filterPreservedUsers =
    stableSelectedUsernames.length > 0 ? stableSelectedUsernames : selectedUsers

  const canShowResults =
    selectedProfiles.length > 0 && error === null && canCompare

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-6 text-foreground sm:px-6 sm:py-8">
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
              primarySearchValue={primarySearchValue}
              filterPreservedUsers={filterPreservedUsers}
              redirectTo={redirectTo}
            />
          ) : null}

          {error === null && !matchedProfile && searchMatches.length > 0 ? (
            <CompareCandidateListSection
              title="Choose a user"
              description="Select the person you want to add to this compare group."
              profiles={searchMatches}
              primarySearchValue={primarySearchValue}
              filterPreservedUsers={filterPreservedUsers}
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
                  Add one or more players on the left. Tunes shared by everyone
                  in the group will appear here.
                </p>
              </div>
            )}
          </section>
        </aside>
      </div>
    </main>
  )
}