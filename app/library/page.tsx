import Link from "next/link"
import BulkImportKnownTunesModal from "@/components/BulkImportKnownTunesModal"
import CreateTuneModal from "@/components/CreateTuneModal"
import LibraryList from "@/components/LibraryList"
import { addToLearningList } from "@/lib/actions/lists"
import { removeTuneFromMyApp } from "@/lib/actions/pieces"
import { startLearning } from "@/lib/actions/user-pieces"
import { loadLibraryData } from "@/lib/loaders/library"
import type { LearningList, Piece, UserKnownPiece, UserPiece } from "@/lib/types"

type LearningListItem = {
  piece_id: number
  learning_list_id: number
  learning_lists: {
    id: number
    name: string
    user_id: string
  }
}

type LibraryPageProps = {
  searchParams?: Promise<{
    key?: string
    style?: string
    time_signature?: string
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
  const selectedKey = resolvedSearchParams?.key ?? ""
  const selectedStyle = resolvedSearchParams?.style ?? ""
  const selectedTimeSignature = resolvedSearchParams?.time_signature ?? ""
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

  if (selectedKey) {
    redirectParams.set("key", selectedKey)
  }

  if (selectedStyle) {
    redirectParams.set("style", selectedStyle)
  }

  if (selectedTimeSignature) {
    redirectParams.set("time_signature", selectedTimeSignature)
  }

  const redirectTo = redirectParams.toString()
    ? `/library?${redirectParams.toString()}`
    : "/library"

  const availableKeys = Array.from(
    new Set(
      (pieces ?? [])
        .map((piece) => piece.key)
        .filter((key): key is string => Boolean(key))
    )
  ).sort()

  const availableStyles = Array.from(
    new Set(
      (pieces ?? [])
        .map((piece) => piece.style)
        .filter((style): style is string => Boolean(style))
    )
  ).sort()

  const availableTimeSignatures = Array.from(
    new Set(
      (pieces ?? [])
        .map((piece) => piece.time_signature)
        .filter(
          (timeSignature): timeSignature is string => Boolean(timeSignature)
        )
    )
  ).sort()

  const filteredPieces = (pieces ?? []).filter((piece: Piece) => {
    const matchesKey = selectedKey === "" || piece.key === selectedKey
    const matchesStyle = selectedStyle === "" || piece.style === selectedStyle
    const matchesTimeSignature =
      selectedTimeSignature === "" ||
      piece.time_signature === selectedTimeSignature

    return matchesKey && matchesStyle && matchesTimeSignature
  })

  const hasActiveFilters =
    selectedKey !== "" ||
    selectedStyle !== "" ||
    selectedTimeSignature !== ""

  return (
    <main className="p-8">
      <h1 className="mb-2 text-3xl font-bold">Tunes</h1>
      <p className="mb-4 text-gray-600">Logged in as {user.email}</p>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <CreateTuneModal />
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

      {createTuneStatus === "invalid_key" && (
        <div className="mb-6 rounded border border-red-600 bg-red-50 p-3 text-sm text-red-800">
          Invalid key. Format is 'D', 'Dm' or 'D modal' for modal tunes.
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
          The CSV could not be parsed. Check for broken quotes or malformed rows.
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

      <form method="GET" className="mb-6">
        <label htmlFor="key" className="mb-2 block text-sm font-medium">
          Filter by key
        </label>
        <select
          id="key"
          name="key"
          defaultValue={selectedKey}
          className="mb-4 w-full border p-2"
        >
          <option value="">All keys</option>
          {availableKeys.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>

        <label htmlFor="style" className="mb-2 block text-sm font-medium">
          Filter by style
        </label>
        <select
          id="style"
          name="style"
          defaultValue={selectedStyle}
          className="mb-4 w-full border p-2"
        >
          <option value="">All styles</option>
          {availableStyles.map((style) => (
            <option key={style} value={style}>
              {style}
            </option>
          ))}
        </select>

        <label
          htmlFor="time_signature"
          className="mb-2 block text-sm font-medium"
        >
          Filter by time signature
        </label>
        <select
          id="time_signature"
          name="time_signature"
          defaultValue={selectedTimeSignature}
          className="mb-4 w-full border p-2"
        >
          <option value="">All time signatures</option>
          {availableTimeSignatures.map((timeSignature) => (
            <option key={timeSignature} value={timeSignature}>
              {timeSignature}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-4">
          <button className="bg-black px-4 py-2 text-white">Apply Filter</button>

          {hasActiveFilters && (
            <Link href="/library" className="text-sm underline">
              Clear filters
            </Link>
          )}
        </div>
      </form>

      <LibraryList
        pieces={filteredPieces}
        userPieces={userPieces as UserPiece[] | null}
        userKnownPieces={userKnownPieces as UserKnownPiece[]}
        learningLists={learningLists as LearningList[] | null}
        learningListItems={learningListItems as LearningListItem[] | null}
        startLearning={startLearning}
        addToLearningList={addToLearningList}
        removeTuneFromMyApp={removeTuneFromMyApp}
        redirectTo={redirectTo}
      />
    </main>
  )
}