import LibraryHeaderActions from "@/components/library/LibraryHeaderActions"
import CatalogueWorkspace from "@/components/library/CatalogueWorkspace"
import LibraryStatusMessages from "@/components/library/LibraryStatusMessages"
import PageHeader from "@/components/ui/PageHeader"
import { addToLearningList } from "@/lib/actions/lists"
import {
  deleteCanonicalTuneAsModerator,
  removeTuneFromMyApp,
} from "@/lib/actions/pieces"
import { startLearning } from "@/lib/actions/user-pieces"
import {
  FILTER_FACET_SCAN_LIMIT,
  loadLibraryData,
} from "@/lib/loaders/library"
import { getPieceFilterOptions } from "@/lib/search-filters"
import { describeTuneFilterConstraints } from "@/lib/tune-collections/filter-drafts"
import {
  buildTuneCollectionHref,
  parseTuneCollectionQueryState,
} from "@/lib/tune-collections/pagination"
import type {
  LearningList,
  LearningListItemMembership,
  Piece,
  UserKnownPiece,
  UserPiece,
} from "@/lib/types"

type SearchParamValue = string | string[] | undefined

type LibraryPageProps = {
  searchParams?: Promise<{
    q?: SearchParamValue
    key?: SearchParamValue
    style?: SearchParamValue
    time_signature?: SearchParamValue
    sort?: SearchParamValue
    after?: SearchParamValue
    before?: SearchParamValue
    import?: SearchParamValue
    list_add?: SearchParamValue
    reference_url?: SearchParamValue
    preferred_reference?: SearchParamValue
    create_tune?: SearchParamValue
    bulk_upload?: SearchParamValue
    row?: SearchParamValue
    created_pieces?: SearchParamValue
    reused_pieces?: SearchParamValue
    added_known?: SearchParamValue
    already_known?: SearchParamValue
    added_to_list?: SearchParamValue
    already_in_list?: SearchParamValue
    uploaded_list_id?: SearchParamValue
    remove_tune?: SearchParamValue
    remove_from_practice?: SearchParamValue
    delete_tune?: SearchParamValue
    loop?: SearchParamValue
    scroll_piece?: SearchParamValue
  }>
}

function firstParam(value: SearchParamValue) {
  if (!value) return ""
  return Array.isArray(value) ? value[0] ?? "" : value
}

function numberParam(value: SearchParamValue) {
  return Number(firstParam(value) || "0")
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const resolvedSearchParams = await searchParams

  const collectionState = parseTuneCollectionQueryState({
    q: resolvedSearchParams?.q,
    key: resolvedSearchParams?.key,
    style: resolvedSearchParams?.style,
    time_signature: resolvedSearchParams?.time_signature,
    sort: resolvedSearchParams?.sort,
    after: resolvedSearchParams?.after,
    before: resolvedSearchParams?.before,
  })
  const {
    searchQuery,
    selectedKeys,
    selectedStyles,
    selectedTimeSignatures,
    sort: selectedSort,
    after,
    before,
  } = collectionState
  const scrollPieceId = firstParam(resolvedSearchParams?.scroll_piece)

  const {
    currentUserRole,
    pieces,
    filterOptionPieces,
    totalPieceCount,
    pageInfo,
    userPieces,
    userKnownPieces,
    mediaBundles,
    learningLists,
    learningListItems,
    styleOptions,
  } = await loadLibraryData({
    searchQuery,
    selectedKeys,
    selectedStyles,
    selectedTimeSignatures,
    sort: selectedSort,
    after,
    before,
  })

  const listAddStatus = firstParam(resolvedSearchParams?.list_add)
  const referenceUrlStatus = firstParam(resolvedSearchParams?.reference_url)
  const preferredReferenceStatus = firstParam(
    resolvedSearchParams?.preferred_reference
  )
  const createTuneStatus = firstParam(resolvedSearchParams?.create_tune)
  const bulkUploadStatus = firstParam(resolvedSearchParams?.bulk_upload)
  const bulkUploadRow = firstParam(resolvedSearchParams?.row)
  const removeTuneStatus = firstParam(resolvedSearchParams?.remove_tune)
  const removeFromPracticeStatus = firstParam(
    resolvedSearchParams?.remove_from_practice
  )
  const deleteTuneStatus = firstParam(resolvedSearchParams?.delete_tune)
  const loopStatus = firstParam(resolvedSearchParams?.loop)
  const uploadedListId = firstParam(resolvedSearchParams?.uploaded_list_id)

  const createdPiecesCount = numberParam(resolvedSearchParams?.created_pieces)
  const reusedPiecesCount = numberParam(resolvedSearchParams?.reused_pieces)
  const addedKnownCount = numberParam(resolvedSearchParams?.added_known)
  const alreadyKnownCount = numberParam(resolvedSearchParams?.already_known)
  const addedToListCount = numberParam(resolvedSearchParams?.added_to_list)
  const alreadyInListCount = numberParam(resolvedSearchParams?.already_in_list)

  const stableCollectionState = {
    searchQuery,
    selectedKeys,
    selectedStyles,
    selectedTimeSignatures,
    sort: selectedSort,
  }
  const redirectTo = buildTuneCollectionHref({
    basePath: "/library",
    state: stableCollectionState,
    after,
    before,
  })
  const previousHref = pageInfo.previousCursor
    ? buildTuneCollectionHref({
        basePath: "/library",
        state: stableCollectionState,
        before: pageInfo.previousCursor,
      })
    : null
  const nextHref = pageInfo.nextCursor
    ? buildTuneCollectionHref({
        basePath: "/library",
        state: stableCollectionState,
        after: pageInfo.nextCursor,
      })
    : null

  const loaderPieces = (pieces ?? []) as Piece[]
  const optionPieces = (filterOptionPieces ?? []) as Piece[]

  const {
    keys: availableKeys,
    styles: availableStyles,
    timeSignatures: availableTimeSignatures,
  } = getPieceFilterOptions(optionPieces)

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedKeys.length > 0 ||
    selectedStyles.length > 0 ||
    selectedTimeSignatures.length > 0
  const activeConstraints = describeTuneFilterConstraints({
    searchQuery,
    keys: selectedKeys,
    styles: selectedStyles,
    timeSignatures: selectedTimeSignatures,
  })

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-5 text-foreground md:px-6 md:py-8">
      <PageHeader title="Tunes" className="hidden md:flex" />

      <LibraryHeaderActions styleOptions={styleOptions} />

      <LibraryStatusMessages
        createTuneStatus={createTuneStatus}
        listAddStatus={listAddStatus}
        referenceUrlStatus={referenceUrlStatus}
        preferredReferenceStatus={preferredReferenceStatus}
        removeTuneStatus={removeTuneStatus}
        removeFromPracticeStatus={removeFromPracticeStatus}
        deleteTuneStatus={deleteTuneStatus}
        loopStatus={loopStatus}
        bulkUploadStatus={bulkUploadStatus}
        bulkUploadRow={bulkUploadRow}
        uploadedListId={uploadedListId}
        createdPiecesCount={createdPiecesCount}
        reusedPiecesCount={reusedPiecesCount}
        addedKnownCount={addedKnownCount}
        alreadyKnownCount={alreadyKnownCount}
        addedToListCount={addedToListCount}
        alreadyInListCount={alreadyInListCount}
      />

      <CatalogueWorkspace
        searchQuery={searchQuery}
        selectedKeys={selectedKeys}
        selectedStyles={selectedStyles}
        selectedTimeSignatures={selectedTimeSignatures}
        selectedSort={selectedSort}
        availableKeys={availableKeys}
        availableStyles={availableStyles}
        availableTimeSignatures={availableTimeSignatures}
        filterOptionPieces={optionPieces}
        filterFacetLimit={FILTER_FACET_SCAN_LIMIT}
        pieces={loaderPieces}
        totalCount={totalPieceCount}
        previousHref={previousHref}
        nextHref={nextHref}
        userPieces={userPieces as UserPiece[] | null}
        userKnownPieces={userKnownPieces as UserKnownPiece[]}
        learningLists={learningLists as LearningList[] | null}
        learningListItems={
          learningListItems as LearningListItemMembership[] | null
        }
        currentUserRole={currentUserRole}
        startLearning={startLearning}
        addToLearningList={addToLearningList}
        removeTuneFromMyApp={removeTuneFromMyApp}
        deleteCanonicalTuneAsModerator={deleteCanonicalTuneAsModerator}
        mediaBundles={mediaBundles}
        redirectTo={redirectTo}
        scrollPieceId={scrollPieceId}
        hasActiveFilters={hasActiveFilters}
        activeConstraints={activeConstraints}
      />
    </main>
  )
}
