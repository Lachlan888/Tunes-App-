import LibraryHeaderActions from "@/components/library/LibraryHeaderActions"
import LibraryList from "@/components/library/LibraryList"
import LibraryResultsHeader from "@/components/library/LibraryResultsHeader"
import LibraryStatusMessages from "@/components/library/LibraryStatusMessages"
import PieceSearchFilters from "@/components/library/PieceSearchFilters"
import PageOptionsModal from "@/components/page-options/PageOptionsModal"
import { addToLearningList } from "@/lib/actions/lists"
import {
  deleteCanonicalTuneAsModerator,
  removeTuneFromMyApp,
} from "@/lib/actions/pieces"
import { startLearning } from "@/lib/actions/user-pieces"
import { loadLibraryData } from "@/lib/loaders/library"
import { loadPagePreferences } from "@/lib/loaders/page-preferences"
import { LIBRARY_PAGE_OPTIONS_CONFIG } from "@/lib/page-options/configs"
import { getPieceFilterOptions } from "@/lib/search-filters"
import type { LearningList, Piece, UserKnownPiece, UserPiece } from "@/lib/types"

type SearchParamValue = string | string[] | undefined

type LibraryPageProps = {
  searchParams?: Promise<{
    q?: SearchParamValue
    key?: SearchParamValue
    style?: SearchParamValue
    time_signature?: SearchParamValue
    visible?: SearchParamValue
    page?: SearchParamValue
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
    remove_from_practice?: SearchParamValue
    delete_tune?: SearchParamValue
    scroll_piece?: SearchParamValue
    page_options?: SearchParamValue
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

function parsePage(value: SearchParamValue) {
  const page = Number(firstParam(value) || "1")

  if (!Number.isInteger(page) || page < 1) {
    return 1
  }

  return page
}

function getPageOptionsMessage(status: string) {
  if (status === "saved") return "Tunes page options saved."
  if (status === "reset") return "Tunes page options reset."
  if (status === "error") return "Could not save Tunes page options."

  return null
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const resolvedSearchParams = await searchParams
  const pagePreferences = await loadPagePreferences(
    LIBRARY_PAGE_OPTIONS_CONFIG.pageKey
  )

  const showSection = (sectionId: string) =>
    pagePreferences.visibleSections[sectionId] ?? true

  const searchQuery = firstParam(resolvedSearchParams?.q)
  const selectedKeys = toArray(resolvedSearchParams?.key)
  const selectedStyles = toArray(resolvedSearchParams?.style)
  const selectedTimeSignatures = toArray(resolvedSearchParams?.time_signature)
  const visibleCount = parseVisibleCount(resolvedSearchParams?.visible)
  const requestedPage = parsePage(resolvedSearchParams?.page)
  const scrollPieceId = firstParam(resolvedSearchParams?.scroll_piece)

  const {
    user,
    currentUserRole,
    pieces,
    filterOptionPieces,
    totalPieceCount,
    currentPage,
    userPieces,
    userKnownPieces,
    learningLists,
    learningListItems,
    styleOptions,
  } = await loadLibraryData({
    searchQuery,
    selectedKeys,
    selectedStyles,
    selectedTimeSignatures,
    visibleCount,
    page: requestedPage,
  })

  const pageOptionsMessage = getPageOptionsMessage(
    firstParam(resolvedSearchParams?.page_options)
  )

  const listAddStatus = firstParam(resolvedSearchParams?.list_add)
  const createTuneStatus = firstParam(resolvedSearchParams?.create_tune)
  const bulkUploadStatus = firstParam(resolvedSearchParams?.bulk_upload)
  const bulkUploadRow = firstParam(resolvedSearchParams?.row)
  const removeTuneStatus = firstParam(resolvedSearchParams?.remove_tune)
  const removeFromPracticeStatus = firstParam(
    resolvedSearchParams?.remove_from_practice
  )
  const deleteTuneStatus = firstParam(resolvedSearchParams?.delete_tune)
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
    redirectParams.set("page", String(currentPage))
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

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedKeys.length > 0 ||
    selectedStyles.length > 0 ||
    selectedTimeSignatures.length > 0

  const totalPages =
    visibleCount === "all"
      ? 1
      : Math.max(1, Math.ceil(totalPieceCount / visibleCount))

  const resultsHeaderProps = {
    displayedCount: loaderPieces.length,
    totalCount: totalPieceCount,
    visibleCount,
    currentPage,
    totalPages,
    searchQuery,
    selectedKeys,
    selectedStyles,
    selectedTimeSignatures,
  }

  return (
    <main className="mx-auto max-w-[1500px] px-6 py-8 text-foreground">
      {pageOptionsMessage ? (
        <div className="mb-6 rounded-2xl border border-border bg-card p-4 text-sm font-medium text-foreground shadow-sm">
          {pageOptionsMessage}
        </div>
      ) : null}

      <section className="mb-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Tunes
            </p>
            <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight">
              Browse the tune catalogue
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              Search the shared tune library, add tunes to lists, mark known
              repertoire, or deliberately move tunes into practice.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Logged in as {user.email}
            </p>
          </div>

          <PageOptionsModal
            config={LIBRARY_PAGE_OPTIONS_CONFIG}
            preferences={pagePreferences}
            redirectTo={redirectTo}
          />
        </div>
      </section>

      {showSection("header_actions") ? (
        <LibraryHeaderActions
          styleOptions={styleOptions}
          learningLists={(learningLists ?? []) as LearningList[]}
        />
      ) : null}

      {showSection("status_messages") ? (
        <LibraryStatusMessages
          createTuneStatus={createTuneStatus}
          listAddStatus={listAddStatus}
          removeTuneStatus={removeTuneStatus}
          removeFromPracticeStatus={removeFromPracticeStatus}
          deleteTuneStatus={deleteTuneStatus}
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
      ) : null}

      {showSection("filters") ? (
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
      ) : null}

      {showSection("results_header_top") ? (
        <LibraryResultsHeader {...resultsHeaderProps} />
      ) : null}

      {showSection("tune_results") ? (
        <LibraryList
          pieces={loaderPieces}
          userPieces={userPieces as UserPiece[] | null}
          userKnownPieces={userKnownPieces as UserKnownPiece[]}
          learningLists={learningLists as LearningList[] | null}
          learningListItems={learningListItems as any}
          currentUserRole={currentUserRole}
          startLearning={startLearning}
          addToLearningList={addToLearningList}
          removeTuneFromMyApp={removeTuneFromMyApp}
          deleteCanonicalTuneAsModerator={deleteCanonicalTuneAsModerator}
          redirectTo={redirectTo}
          scrollPieceId={scrollPieceId}
          hasActiveFilters={hasActiveFilters}
        />
      ) : null}

      {showSection("results_header_bottom") ? (
        <LibraryResultsHeader {...resultsHeaderProps} position="bottom" />
      ) : null}
    </main>
  )
}