import LibraryHeaderActions from "@/components/library/LibraryHeaderActions"
import LibraryList from "@/components/library/LibraryList"
import LibraryResultsHeader from "@/components/library/LibraryResultsHeader"
import LibraryStatusMessages from "@/components/library/LibraryStatusMessages"
import PieceSearchFilters from "@/components/PieceSearchFilters"
import { addToLearningList } from "@/lib/actions/lists"
import { removeTuneFromMyApp } from "@/lib/actions/pieces"
import { startLearning } from "@/lib/actions/user-pieces"
import { loadLibraryData } from "@/lib/loaders/library"
import {
  getPieceFilterOptions,
  pieceMatchesFilters,
} from "@/lib/search-filters"
import type { LearningList, Piece, UserKnownPiece, UserPiece } from "@/lib/types"

type SearchParamValue = string | string[] | undefined

type LibraryPageProps = {
  searchParams?: Promise<{
    q?: SearchParamValue
    key?: SearchParamValue
    style?: SearchParamValue
    time_signature?: SearchParamValue
    visible?: SearchParamValue
    import?: SearchParamValue
    list_add?: SearchParamValue
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
  }>
}

function toArray(value: SearchParamValue) {
  if (!value) return []
  return Array.isArray(value) ? value.filter(Boolean) : [value]
}

function firstParam(value: SearchParamValue) {
  if (!value) return ""
  return Array.isArray(value) ? value[0] ?? "" : value
}

function numberParam(value: SearchParamValue) {
  return Number(firstParam(value) || "0")
}

function parseVisibleCount(value: SearchParamValue): number | "all" {
  const singleValue = firstParam(value) || "20"

  if (singleValue === "all") return "all"
  if (singleValue === "50") return 50
  if (singleValue === "100") return 100

  return 20
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const resolvedSearchParams = await searchParams

  const searchQuery = firstParam(resolvedSearchParams?.q)
  const selectedKeys = toArray(resolvedSearchParams?.key)
  const selectedStyles = toArray(resolvedSearchParams?.style)
  const selectedTimeSignatures = toArray(resolvedSearchParams?.time_signature)
  const visibleCount = parseVisibleCount(resolvedSearchParams?.visible)

  const {
    user,
    pieces,
    filterOptionPieces,
    userPieces,
    userKnownPieces,
    learningLists,
    learningListItems,
    styleOptions,
  } = await loadLibraryData({
    searchQuery,
    selectedKeys,
    selectedTimeSignatures,
    visibleCount,
  })

  const listAddStatus = firstParam(resolvedSearchParams?.list_add)
  const createTuneStatus = firstParam(resolvedSearchParams?.create_tune)
  const bulkUploadStatus = firstParam(resolvedSearchParams?.bulk_upload)
  const bulkUploadRow = firstParam(resolvedSearchParams?.row)
  const removeTuneStatus = firstParam(resolvedSearchParams?.remove_tune)
  const uploadedListId = firstParam(resolvedSearchParams?.uploaded_list_id)

  const createdPiecesCount = numberParam(resolvedSearchParams?.created_pieces)
  const reusedPiecesCount = numberParam(resolvedSearchParams?.reused_pieces)
  const addedKnownCount = numberParam(resolvedSearchParams?.added_known)
  const alreadyKnownCount = numberParam(resolvedSearchParams?.already_known)
  const addedToListCount = numberParam(resolvedSearchParams?.added_to_list)
  const alreadyInListCount = numberParam(resolvedSearchParams?.already_in_list)

  const redirectParams = new URLSearchParams()

  if (searchQuery) {
    redirectParams.set("q", searchQuery)
  }

  for (const key of selectedKeys) {
    redirectParams.append("key", key)
  }

  for (const style of selectedStyles) {
    redirectParams.append("style", style)
  }

  for (const timeSignature of selectedTimeSignatures) {
    redirectParams.append("time_signature", timeSignature)
  }

  if (visibleCount === "all") {
    redirectParams.set("visible", "all")
  } else {
    redirectParams.set("visible", String(visibleCount))
  }

  const redirectTo = redirectParams.toString()
    ? `/library?${redirectParams.toString()}`
    : "/library"

  const loaderPieces = (pieces ?? []) as Piece[]
  const optionPieces = (filterOptionPieces ?? []) as Piece[]

  const {
    keys: availableKeys,
    styles: availableStyles,
    timeSignatures: availableTimeSignatures,
  } = getPieceFilterOptions(optionPieces)

  const filteredPieces = loaderPieces.filter((piece) =>
    pieceMatchesFilters(piece, {
      q: "",
      keys: [],
      styles: selectedStyles,
      timeSignatures: [],
    })
  )

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedKeys.length > 0 ||
    selectedStyles.length > 0 ||
    selectedTimeSignatures.length > 0

  return (
    <main className="p-8">
      <h1 className="mb-2 text-3xl font-bold">Tunes</h1>
      <p className="mb-4 text-gray-600">Logged in as {user.email}</p>

      <LibraryHeaderActions
        styleOptions={styleOptions}
        learningLists={(learningLists ?? []) as LearningList[]}
      />

      <LibraryStatusMessages
        createTuneStatus={createTuneStatus}
        listAddStatus={listAddStatus}
        removeTuneStatus={removeTuneStatus}
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

      <PieceSearchFilters
        basePath="/library"
        searchLabel="Search by title"
        searchPlaceholder="Search tunes"
        searchValue={searchQuery}
        selectedKeys={selectedKeys}
        selectedStyles={selectedStyles}
        selectedTimeSignatures={selectedTimeSignatures}
        availableKeys={availableKeys}
        availableStyles={availableStyles}
        availableTimeSignatures={availableTimeSignatures}
        hasActiveFilters={hasActiveFilters}
        preservedParams={{
          visible: visibleCount === "all" ? "all" : String(visibleCount),
        }}
      />

      <LibraryResultsHeader
        filteredCount={filteredPieces.length}
        visibleCount={visibleCount}
        searchQuery={searchQuery}
        selectedKeys={selectedKeys}
        selectedStyles={selectedStyles}
        selectedTimeSignatures={selectedTimeSignatures}
      />

      <LibraryList
        pieces={filteredPieces}
        userPieces={userPieces as UserPiece[] | null}
        userKnownPieces={userKnownPieces as UserKnownPiece[]}
        learningLists={learningLists as LearningList[] | null}
        learningListItems={learningListItems as any}
        startLearning={startLearning}
        addToLearningList={addToLearningList}
        removeTuneFromMyApp={removeTuneFromMyApp}
        redirectTo={redirectTo}
        hasActiveFilters={hasActiveFilters}
      />
    </main>
  )
}