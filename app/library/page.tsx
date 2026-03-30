import BulkImportKnownTunesModal from "@/components/BulkImportKnownTunesModal"
import CreateTuneModal from "@/components/CreateTuneModal"
import LibraryList from "@/components/LibraryList"
import PieceSearchFilters from "@/components/PieceSearchFilters"
import { addToLearningList } from "@/lib/actions/lists"
import { removeTuneFromMyApp } from "@/lib/actions/pieces"
import { startLearning } from "@/lib/actions/user-pieces"
import { loadLibraryData } from "@/lib/loaders/library"
import {
  getPieceFilterOptions,
  pieceMatchesFilters,
} from "@/lib/search-filters"
import { createClient } from "@/lib/supabase/server"
import type { LearningList, Piece, UserKnownPiece, UserPiece } from "@/lib/types"

type StyleOption = {
  id: number
  slug: string
  label: string
}

type LibraryPageProps = {
  searchParams?: Promise<{
    q?: string | string[]
    key?: string | string[]
    style?: string | string[]
    time_signature?: string | string[]
    list_add?: string
    create_tune?: string
    bulk_upload?: string
    row?: string
    created_pieces?: string
    reused_pieces?: string
    added_known?: string
    already_known?: string
    added_to_list?: string
    already_in_list?: string
    remove_tune?: string
  }>
}

function toArray(value: string | string[] | undefined) {
  if (!value) return []
  return Array.isArray(value) ? value.filter(Boolean) : [value]
}

export default async function LibraryPage({
  searchParams,
}: LibraryPageProps) {
  const {
    user,
    pieces,
    userPieces,
    userKnownPieces,
    learningLists,
    learningListItems,
  } = await loadLibraryData()

  const resolvedSearchParams = await searchParams
  const searchQuery = Array.isArray(resolvedSearchParams?.q)
    ? resolvedSearchParams?.q[0] ?? ""
    : resolvedSearchParams?.q ?? ""

  const selectedKeys = toArray(resolvedSearchParams?.key)
  const selectedStyles = toArray(resolvedSearchParams?.style)
  const selectedTimeSignatures = toArray(resolvedSearchParams?.time_signature)

  const listAddStatus = resolvedSearchParams?.list_add ?? ""
  const createTuneStatus = resolvedSearchParams?.create_tune ?? ""
  const bulkUploadStatus = resolvedSearchParams?.bulk_upload ?? ""
  const bulkUploadRow = resolvedSearchParams?.row ?? ""
  const removeTuneStatus = resolvedSearchParams?.remove_tune ?? ""

  const createdPiecesCount = Number(resolvedSearchParams?.created_pieces ?? "0")
  const reusedPiecesCount = Number(resolvedSearchParams?.reused_pieces ?? "0")
  const addedKnownCount = Number(resolvedSearchParams?.added_known ?? "0")
  const alreadyKnownCount = Number(resolvedSearchParams?.already_known ?? "0")
  const addedToListCount = Number(resolvedSearchParams?.added_to_list ?? "0")
  const alreadyInListCount = Number(
    resolvedSearchParams?.already_in_list ?? "0"
  )

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

  const redirectTo = redirectParams.toString()
    ? `/library?${redirectParams.toString()}`
    : "/library"

  const supabase = await createClient()

  const { data: styleRows, error: stylesError } = await supabase
    .from("styles")
    .select("id, slug, label")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  const styleOptions: StyleOption[] = stylesError ? [] : styleRows ?? []

  const allPieces = (pieces ?? []) as Piece[]

  const {
    keys: availableKeys,
    styles: availableStyles,
    timeSignatures: availableTimeSignatures,
  } = getPieceFilterOptions(allPieces)

  const filteredPieces = allPieces.filter((piece) =>
    pieceMatchesFilters(piece, {
      q: searchQuery,
      keys: selectedKeys,
      styles: selectedStyles,
      timeSignatures: selectedTimeSignatures,
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

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <CreateTuneModal styleOptions={styleOptions} />
        <BulkImportKnownTunesModal />
      </div>

      {createTuneStatus === "success" && (
        <div className="mb-6 rounded border border-green-600 bg-green-50 p-3 text-sm text-green-800">
          Tune created.
        </div>
      )}

      {createTuneStatus === "missing_title" && (
        <div className="mb-6 rounded border border-yellow-600 bg-yellow-50 p-3 text-sm text-yellow-800">
          Please enter a tune title.
        </div>
      )}

      {createTuneStatus === "duplicate" && (
        <div className="mb-6 rounded border border-yellow-600 bg-yellow-50 p-3 text-sm text-yellow-800">
          A tune with that title already exists; either add that tune or give
          this one a new title. For example, if Black Mountain Rag already
          exists in D you can make it in A by titling it Black Mountain Rag in
          A.
        </div>
      )}

      {createTuneStatus === "invalid_key" && (
        <div className="mb-6 rounded border border-red-600 bg-red-50 p-3 text-sm text-red-800">
          Invalid key. Format is "D", "Dm" or "D modal" for modal tunes.
        </div>
      )}

      {createTuneStatus === "error" && (
        <div className="mb-6 rounded border border-red-600 bg-red-50 p-3 text-sm text-red-800">
          Could not create tune.
        </div>
      )}

      {listAddStatus === "success" && (
        <div className="mb-6 rounded border border-green-600 bg-green-50 p-3 text-sm text-green-800">
          Tune added to list.
        </div>
      )}

      {listAddStatus === "duplicate" && (
        <div className="mb-6 rounded border border-gray-400 bg-gray-50 p-3 text-sm text-gray-800">
          That tune is already in this list.
        </div>
      )}

      {removeTuneStatus === "success" && (
        <div className="mb-6 rounded border border-green-600 bg-green-50 p-3 text-sm text-green-800">
          Tune removed from your app.
        </div>
      )}

      {removeTuneStatus === "missing_piece" && (
        <div className="mb-6 rounded border border-yellow-600 bg-yellow-50 p-3 text-sm text-yellow-800">
          Could not tell which tune to remove.
        </div>
      )}

      {removeTuneStatus === "error" && (
        <div className="mb-6 rounded border border-red-600 bg-red-50 p-3 text-sm text-red-800">
          Could not remove tune.
        </div>
      )}

      {bulkUploadStatus === "received" && (
        <div className="mb-6 rounded border border-green-600 bg-green-50 p-3 text-sm text-green-800">
          CSV received. Next step is parsing and validation.
        </div>
      )}

      {bulkUploadStatus === "parsed" && (
        <div className="mb-6 rounded border border-green-600 bg-green-50 p-3 text-sm text-green-800">
          CSV parsed successfully. Header row is valid and data rows were found.
        </div>
      )}

      {bulkUploadStatus === "validated" && (
        <div className="mb-6 rounded border border-green-600 bg-green-50 p-3 text-sm text-green-800">
          CSV validated successfully. All rows have the right column count and a
          title.
        </div>
      )}

      {bulkUploadStatus === "imported" && (
        <div className="mb-6 rounded border border-green-600 bg-green-50 p-3 text-sm text-green-800">
          <p className="font-medium">Bulk import completed.</p>
          <p className="mt-1">
            Created pieces: {createdPiecesCount}. Reused existing pieces:{" "}
            {reusedPiecesCount}.
          </p>
          <p>
            Added to known tunes: {addedKnownCount}. Already known:{" "}
            {alreadyKnownCount}.
          </p>
          <p>
            Added to Uploaded Tunes list: {addedToListCount}. Already in list:{" "}
            {alreadyInListCount}.
          </p>
        </div>
      )}

      {bulkUploadStatus === "nothing_to_import" && (
        <div className="mb-6 rounded border border-yellow-600 bg-yellow-50 p-3 text-sm text-yellow-800">
          No tunes were available to import.
        </div>
      )}

      {bulkUploadStatus === "missing_file" && (
        <div className="mb-6 rounded border border-yellow-600 bg-yellow-50 p-3 text-sm text-yellow-800">
          Please choose a CSV file.
        </div>
      )}

      {bulkUploadStatus === "empty_file" && (
        <div className="mb-6 rounded border border-yellow-600 bg-yellow-50 p-3 text-sm text-yellow-800">
          The selected CSV file is empty.
        </div>
      )}

      {bulkUploadStatus === "empty_rows" && (
        <div className="mb-6 rounded border border-yellow-600 bg-yellow-50 p-3 text-sm text-yellow-800">
          The CSV has a valid header row but no tune rows underneath it.
        </div>
      )}

      {bulkUploadStatus === "invalid_type" && (
        <div className="mb-6 rounded border border-red-600 bg-red-50 p-3 text-sm text-red-800">
          That file does not look like a CSV.
        </div>
      )}

      {bulkUploadStatus === "invalid_csv" && (
        <div className="mb-6 rounded border border-red-600 bg-red-50 p-3 text-sm text-red-800">
          The CSV could not be parsed. Check for broken quotes or malformed
          rows.
        </div>
      )}

      {bulkUploadStatus === "invalid_headers" && (
        <div className="mb-6 rounded border border-red-600 bg-red-50 p-3 text-sm text-red-800">
          CSV headers are invalid. Use the template and keep this exact column
          order: title, key, style, time_signature, reference_url
        </div>
      )}

      {bulkUploadStatus === "invalid_row_shape" && (
        <div className="mb-6 rounded border border-red-600 bg-red-50 p-3 text-sm text-red-800">
          CSV row {bulkUploadRow || "?"} does not have exactly 5 columns.
        </div>
      )}

      {bulkUploadStatus === "missing_title_row" && (
        <div className="mb-6 rounded border border-red-600 bg-red-50 p-3 text-sm text-red-800">
          CSV row {bulkUploadRow || "?"} is missing a title.
        </div>
      )}

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
      />

      <h2 className="mb-4 text-2xl font-semibold">All tunes</h2>

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
      />
    </main>
  )
}