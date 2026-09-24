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
import { loadCompareData, loadCompareUserSearch } from "@/lib/loaders/compare"
import type { Piece } from "@/lib/types"
import { parseComparePage } from "@/lib/compare-outcomes"

export const dynamic = "force-dynamic"

type ComparePageProps = {
  searchParams?: Promise<{
    user?: string | string[]
    q?: string | string[]
    key?: string | string[]
    style?: string | string[]
    time_signature?: string | string[]
    include_practice?: string | string[]
    user_search?: string | string[]
    friend_request?: string
    group?: string | string[]
    page?: string | string[]
  }>
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const resolvedSearchParams = await searchParams

  const selectedUsers = toArray(resolvedSearchParams?.user)
  const userSearch = Array.isArray(resolvedSearchParams?.user_search)
    ? resolvedSearchParams?.user_search[0]?.trim() ?? ""
    : resolvedSearchParams?.user_search?.trim() ?? ""

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
  const rawGroup = Array.isArray(resolvedSearchParams?.group)
    ? resolvedSearchParams?.group[0]
    : resolvedSearchParams?.group
  const overlapGroup =
    rawGroup === "strong" || rawGroup === "shaky" ? rawGroup : "all"
  const overlapPage = parseComparePage(resolvedSearchParams?.page)

  const compareData = await loadCompareData(selectedUsers, { includePractice })

  const userSearchResolution = userSearch
    ? await loadCompareUserSearch(compareData.currentUserId, userSearch)
    : null

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
  } = compareData

  const activeError = userSearchResolution?.error ?? error
  const primarySearchValue =
    userSearchResolution?.searchValue ?? compareData.searchValue
  const candidateMatchingProfiles =
    userSearchResolution?.matchingProfiles ?? matchingProfiles
  const candidateSearchMatches =
    userSearchResolution?.searchMatches ?? searchMatches

  const {
    keys: availableKeys,
    styles: availableStyles,
    timeSignatures: availableTimeSignatures,
  } = getPieceFilterOptions(mutualPieces)

  const groupIds = new Set(
    overlapGroup === "strong"
      ? compareData.outcomeGroups.sharedStrongIds
      : overlapGroup === "shaky"
        ? compareData.outcomeGroups.sharedShakyIds
        : compareData.outcomeGroups.playableTogetherIds
  )
  const allFilteredPieces = mutualPieces.filter((piece: Piece) =>
    groupIds.has(piece.id) &&
    pieceMatchesFilters(piece, {
      q: titleQuery,
      keys: selectedKeys,
      styles: selectedStyles,
      timeSignatures: selectedTimeSignatures,
    })
  )
  const pageSize = 20
  const pageStart = (overlapPage - 1) * pageSize
  const filteredPieces = allFilteredPieces.slice(pageStart, pageStart + pageSize)

  const hasActiveFilters =
    titleQuery !== "" ||
    selectedKeys.length > 0 ||
    selectedStyles.length > 0 ||
    selectedTimeSignatures.length > 0

  const redirectTo = buildCompareHref(selectedUsers, { includePractice })

  const stableSelectedUsernames = [
    ...selectedProfiles
      .map((profile) => profile.username)
      .filter((username): username is string => Boolean(username)),
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

  const overlapHref = (page: number) =>
    buildCompareHref(filterPreservedUsers, {
      q: titleQuery,
      key: selectedKeys,
      style: selectedStyles,
      time_signature: selectedTimeSignatures,
      includePractice,
      group: overlapGroup,
      page,
    })

  const suggestedPanelIds = new Set([
    ...compareData.outcomeGroups.playableTogetherIds.slice(0, 20),
    ...compareData.outcomeGroups.suggestedSetIds,
  ])

  const compareViewProps: CompareViewProps = {
    currentUserId: compareData.currentUserId,
    selectedProfiles,
    filterPreservedUsers,
    titleQuery,
    selectedKeys,
    selectedStyles,
    selectedTimeSignatures,
    includePractice,
    friendRequestStatus,
    error: activeError,
    primarySearchValue,
    compareSuggestions,
    matchingProfiles: candidateMatchingProfiles,
    searchMatches: candidateSearchMatches,
    matchedProfile: userSearchResolution ? null : matchedProfile,
    isAcceptedFriend,
    canCompare,
    redirectTo,
    compareHeading,
    filteredPieces,
    availableKeys,
    availableStyles,
    availableTimeSignatures,
    hasActiveFilters,
    canShowResults,
    outcomeGroups: compareData.outcomeGroups,
    outcomePieces: compareData.outcomePieces.filter((piece) => suggestedPanelIds.has(piece.id)),
    overlapGroup,
    overlapPage,
    overlapTotal: allFilteredPieces.length,
    previousOverlapHref: overlapPage > 1 ? overlapHref(overlapPage - 1) : null,
    nextOverlapHref:
      pageStart + pageSize < allFilteredPieces.length
        ? overlapHref(overlapPage + 1)
        : null,
  }

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-5 text-foreground sm:px-6 sm:py-8">
      <CompareMobile {...compareViewProps} />
    </main>
  )
}
