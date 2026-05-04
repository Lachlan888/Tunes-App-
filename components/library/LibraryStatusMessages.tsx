import Link from "next/link"

type LibraryStatusMessagesProps = {
  createTuneStatus: string
  listAddStatus: string
  removeTuneStatus: string
  bulkUploadStatus: string
  bulkUploadRow: string
  uploadedListId: string
  createdPiecesCount: number
  reusedPiecesCount: number
  addedKnownCount: number
  alreadyKnownCount: number
  addedToListCount: number
  alreadyInListCount: number
}

function StatusBanner({
  tone,
  children,
}: {
  tone: "success" | "warning" | "error" | "neutral"
  children: React.ReactNode
}) {
  const toneClassNames = {
    success: "border-green-600 bg-green-50 text-green-800",
    warning: "border-yellow-600 bg-yellow-50 text-yellow-800",
    error: "border-red-600 bg-red-50 text-red-800",
    neutral: "border-gray-400 bg-gray-50 text-gray-800",
  }

  return (
    <div className={`mb-6 rounded border p-3 text-sm ${toneClassNames[tone]}`}>
      {children}
    </div>
  )
}

export default function LibraryStatusMessages({
  createTuneStatus,
  listAddStatus,
  removeTuneStatus,
  bulkUploadStatus,
  bulkUploadRow,
  uploadedListId,
  createdPiecesCount,
  reusedPiecesCount,
  addedKnownCount,
  alreadyKnownCount,
  addedToListCount,
  alreadyInListCount,
}: LibraryStatusMessagesProps) {
  return (
    <>
      {createTuneStatus === "success" && (
        <StatusBanner tone="success">Tune created.</StatusBanner>
      )}

      {createTuneStatus === "missing_title" && (
        <StatusBanner tone="warning">Please enter a tune title.</StatusBanner>
      )}

      {createTuneStatus === "duplicate" && (
        <StatusBanner tone="warning">
          A tune with that title already exists; either add that tune or give
          this one a new title. For example, if Black Mountain Rag already
          exists in D you can make it in A by titling it Black Mountain Rag in A.
        </StatusBanner>
      )}

      {createTuneStatus === "invalid_key" && (
        <StatusBanner tone="error">
          Invalid key. Format is &quot;D&quot;, &quot;Dm&quot; or &quot;D
          modal&quot; for modal tunes.
        </StatusBanner>
      )}

      {createTuneStatus === "error" && (
        <StatusBanner tone="error">Could not create tune.</StatusBanner>
      )}

      {listAddStatus === "success" && (
        <StatusBanner tone="success">Tune added to list.</StatusBanner>
      )}

      {listAddStatus === "duplicate" && (
        <StatusBanner tone="neutral">
          That tune is already in this list.
        </StatusBanner>
      )}

      {removeTuneStatus === "success" && (
        <StatusBanner tone="success">Tune removed from your app.</StatusBanner>
      )}

      {removeTuneStatus === "missing_piece" && (
        <StatusBanner tone="warning">
          Could not tell which tune to remove.
        </StatusBanner>
      )}

      {removeTuneStatus === "error" && (
        <StatusBanner tone="error">Could not remove tune.</StatusBanner>
      )}

      {bulkUploadStatus === "received" && (
        <StatusBanner tone="success">
          CSV received. Next step is parsing and validation.
        </StatusBanner>
      )}

      {bulkUploadStatus === "parsed" && (
        <StatusBanner tone="success">
          CSV parsed successfully. Header row is valid and data rows were found.
        </StatusBanner>
      )}

      {bulkUploadStatus === "validated" && (
        <StatusBanner tone="success">
          CSV validated successfully. All rows have the right column count and a
          title.
        </StatusBanner>
      )}

      {bulkUploadStatus === "imported" && (
        <div className="mb-6 rounded border border-green-600 bg-green-50 p-4 text-sm text-green-800">
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

          <div className="mt-4 flex flex-wrap gap-3">
            {uploadedListId && (
              <Link
                href={`/learning-lists/${uploadedListId}`}
                className="rounded bg-green-800 px-3 py-2 text-sm font-medium text-white"
              >
                View Uploaded Tunes
              </Link>
            )}

            <Link
              href="/library/known"
              className="rounded border border-green-700 bg-white px-3 py-2 text-sm font-medium text-green-900"
            >
              View Known Tunes
            </Link>

            <Link
              href="/library"
              className="rounded border border-green-700 bg-white px-3 py-2 text-sm font-medium text-green-900"
            >
              Start Practice
            </Link>
          </div>
        </div>
      )}

      {bulkUploadStatus === "nothing_to_import" && (
        <StatusBanner tone="warning">
          No tunes were available to import.
        </StatusBanner>
      )}

      {bulkUploadStatus === "missing_file" && (
        <StatusBanner tone="warning">Please choose a CSV file.</StatusBanner>
      )}

      {bulkUploadStatus === "empty_file" && (
        <StatusBanner tone="warning">
          The selected CSV file is empty.
        </StatusBanner>
      )}

      {bulkUploadStatus === "empty_rows" && (
        <StatusBanner tone="warning">
          The CSV has a valid header row but no tune rows underneath it.
        </StatusBanner>
      )}

      {bulkUploadStatus === "invalid_type" && (
        <StatusBanner tone="error">
          That file does not look like a CSV.
        </StatusBanner>
      )}

      {bulkUploadStatus === "invalid_csv" && (
        <StatusBanner tone="error">
          The CSV could not be parsed. Check for broken quotes or malformed rows.
        </StatusBanner>
      )}

      {bulkUploadStatus === "invalid_headers" && (
        <StatusBanner tone="error">
          CSV headers are invalid. Use the template and keep this exact column
          order: title, key, style, time_signature, reference_url
        </StatusBanner>
      )}

      {bulkUploadStatus === "invalid_row_shape" && (
        <StatusBanner tone="error">
          CSV row {bulkUploadRow || "?"} does not have exactly 5 columns.
        </StatusBanner>
      )}

      {bulkUploadStatus === "missing_title_row" && (
        <StatusBanner tone="error">
          CSV row {bulkUploadRow || "?"} is missing a title.
        </StatusBanner>
      )}
    </>
  )
}