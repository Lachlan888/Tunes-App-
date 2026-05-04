import CompareBlockedSection from "@/components/compare/CompareBlockedSection"
import CompareCandidateListSection from "@/components/compare/CompareCandidateListSection"
import CompareMutualPiecesSection from "@/components/compare/CompareMutualPiecesSection"
import CompareResultsHeader from "@/components/compare/CompareResultsHeader"
import CompareSearchForm from "@/components/compare/CompareSearchForm"
import CompareStatusMessage from "@/components/compare/CompareStatusMessage"
import CompareSuggestionsSection from "@/components/compare/CompareSuggestionsSection"
import CurrentCompareGroupSection from "@/components/compare/CurrentCompareGroupSection"
import {
  getPieceFilterOptions,
  pieceMatchesFilters,
} from "@/lib/search-filters"
import { buildCompareHref, toArray } from "@/lib/compare-page"
import { loadCompareData } from "@/lib/loaders/compare"
import type { Piece } from "@/lib/types"

type ComparePageProps = {
  searchParams?: Promise<{
    user?: string | string[]
    q?: string | string[]
    key?: string | string[]
    style?: string | string[]
    time_signature?: string | string[]
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
  } = await loadCompareData(selectedUsers)

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

  const redirectTo = buildCompareHref(selectedUsers)

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

  return (
    <main className="p-8">
      <h1 className="mb-2 text-3xl font-bold">Compare Tunes</h1>
      <p className="mb-6 text-gray-600">
        Build a group, then see the tunes common to everyone in it.
      </p>

      <CompareSearchForm initialQuery="" selectedUsers={filterPreservedUsers} />

      {filterPreservedUsers.length > 0 && (
        <CurrentCompareGroupSection
          selectedProfiles={selectedProfiles}
          filterPreservedUsers={filterPreservedUsers}
          titleQuery={titleQuery}
          selectedKeys={selectedKeys}
          selectedStyles={selectedStyles}
          selectedTimeSignatures={selectedTimeSignatures}
        />
      )}

      {friendRequestStatus === "sent" && (
        <CompareStatusMessage tone="success">
          Friend request sent.
        </CompareStatusMessage>
      )}

      {friendRequestStatus === "missing_user" && (
        <CompareStatusMessage tone="warning">
          Please choose a valid user.
        </CompareStatusMessage>
      )}

      {friendRequestStatus === "self" && (
        <CompareStatusMessage tone="warning">
          You cannot send a friend request to yourself.
        </CompareStatusMessage>
      )}

      {friendRequestStatus === "not_found" && (
        <CompareStatusMessage tone="error">
          That user could not be found.
        </CompareStatusMessage>
      )}

      {friendRequestStatus === "duplicate" && (
        <CompareStatusMessage tone="neutral">
          A pending or accepted connection already exists with that user.
        </CompareStatusMessage>
      )}

      <CompareSuggestionsSection
        compareSuggestions={compareSuggestions}
        filterPreservedUsers={filterPreservedUsers}
      />

      {error === "missing_search" && (
        <CompareStatusMessage tone="neutral">
          Add at least one username or display name to start comparing.
        </CompareStatusMessage>
      )}

      {error === "user_not_found" && (
        <CompareStatusMessage tone="error">
          No user found for “{primarySearchValue}”.
        </CompareStatusMessage>
      )}

      {error === "self_compare" && (
        <CompareStatusMessage tone="warning">
          You cannot add your own profile to the compare group.
        </CompareStatusMessage>
      )}

      {error === "multiple_matches" && (
        <CompareCandidateListSection
          title="Choose a user"
          description={`More than one user matched “${primarySearchValue}”.`}
          profiles={matchingProfiles}
          primarySearchValue={primarySearchValue}
          filterPreservedUsers={filterPreservedUsers}
          redirectTo={redirectTo}
        />
      )}

      {error === null && !matchedProfile && searchMatches.length > 0 && (
        <CompareCandidateListSection
          title="Choose a user"
          description="Select the person you want to add to this compare group."
          profiles={searchMatches}
          primarySearchValue={primarySearchValue}
          filterPreservedUsers={filterPreservedUsers}
          redirectTo={redirectTo}
        />
      )}

      {matchedProfile && error === null && !canCompare && (
        <CompareBlockedSection
          matchedProfile={matchedProfile}
          isAcceptedFriend={isAcceptedFriend}
          redirectTo={redirectTo}
        />
      )}

      {selectedProfiles.length > 0 && error === null && canCompare && (
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
          />
        </>
      )}
    </main>
  )
}