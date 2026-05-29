import CompareDesktop from "@/components/compare/CompareDesktop"
import CompareMobile from "@/components/compare/CompareMobile"
import type { CompareViewProps } from "@/components/compare/compare-view-types"
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

export const dynamic = "force-dynamic"

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

export default async function ComparePage({ searchParams }: ComparePageProps) {
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

  const compareViewProps: CompareViewProps = {
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
  }

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-5 text-foreground sm:px-6 sm:py-8">
      <div className="md:hidden">
        <CompareMobile {...compareViewProps} />
      </div>

      <div className="hidden md:block">
        <CompareDesktop {...compareViewProps} />
      </div>
    </main>
  )
}
