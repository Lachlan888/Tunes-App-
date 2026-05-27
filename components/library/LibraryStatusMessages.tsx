import Link from "next/link"
import { buttonStyles } from "@/components/ui/buttonStyles"
import { statusStyles, type StatusTone } from "@/components/ui/statusStyles"

type LibraryStatusMessagesProps = {
  createTuneStatus: string
  listAddStatus: string
  referenceUrlStatus: string
  preferredReferenceStatus: string
  removeTuneStatus: string
  removeFromPracticeStatus: string
  deleteTuneStatus: string
  loopStatus: string
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
  tone: StatusTone
  children: React.ReactNode
}) {
  return (
    <div
      className={`mb-6 rounded-2xl border p-4 text-sm font-medium shadow-sm ${statusStyles[tone]}`}
    >
      {children}
    </div>
  )
}

export default function LibraryStatusMessages({
  createTuneStatus,
  listAddStatus,
  referenceUrlStatus,
  preferredReferenceStatus,
  removeTuneStatus,
  removeFromPracticeStatus,
  deleteTuneStatus,
  loopStatus,
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
        <StatusBanner tone="success">
          Tune added to selected list/s.
        </StatusBanner>
      )}

      {listAddStatus === "partial" && (
        <StatusBanner tone="success">
          Tune added to the selected list/s that did not already contain it.
        </StatusBanner>
      )}

      {listAddStatus === "duplicate" && (
        <StatusBanner tone="neutral">
          That tune is already in the selected list/s.
        </StatusBanner>
      )}

      {listAddStatus === "missing_list" && (
        <StatusBanner tone="warning">
          Choose at least one list before adding the tune.
        </StatusBanner>
      )}

      {listAddStatus === "missing_piece" && (
        <StatusBanner tone="warning">
          Could not tell which tune to add.
        </StatusBanner>
      )}

      {listAddStatus === "error" && (
        <StatusBanner tone="error">Could not add tune to list/s.</StatusBanner>
      )}

      {referenceUrlStatus === "added" && (
        <StatusBanner tone="success">Reference added.</StatusBanner>
      )}

      {referenceUrlStatus === "already_present" && (
        <StatusBanner tone="neutral">
          This tune already has a reference.
        </StatusBanner>
      )}

      {referenceUrlStatus === "missing_piece" && (
        <StatusBanner tone="warning">
          Could not tell which tune to update.
        </StatusBanner>
      )}

      {referenceUrlStatus === "invalid_url" && (
        <StatusBanner tone="warning">
          That does not look like a valid URL.
        </StatusBanner>
      )}

      {referenceUrlStatus === "not_youtube" && (
        <StatusBanner tone="warning">
          Choose a YouTube video URL for this reference.
        </StatusBanner>
      )}

      {referenceUrlStatus === "error" && (
        <StatusBanner tone="error">Could not add reference.</StatusBanner>
      )}

      {preferredReferenceStatus === "saved" && (
        <StatusBanner tone="success">Preferred reference saved.</StatusBanner>
      )}

      {preferredReferenceStatus === "removed" && (
        <StatusBanner tone="success">Preferred reference removed.</StatusBanner>
      )}

      {preferredReferenceStatus === "missing_piece" && (
        <StatusBanner tone="warning">
          Could not tell which tune to update.
        </StatusBanner>
      )}

      {preferredReferenceStatus === "invalid_url" && (
        <StatusBanner tone="warning">
          That does not look like a valid URL.
        </StatusBanner>
      )}

      {preferredReferenceStatus === "not_youtube" && (
        <StatusBanner tone="warning">
          Preferred references must be YouTube links for now.
        </StatusBanner>
      )}

      {preferredReferenceStatus === "error" && (
        <StatusBanner tone="error">
          Could not update preferred reference.
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

      {removeFromPracticeStatus === "success" && (
        <StatusBanner tone="success">
          Tune removed from active practice.
        </StatusBanner>
      )}

      {removeFromPracticeStatus === "missing_user_piece" && (
        <StatusBanner tone="warning">
          Could not tell which practice item to remove.
        </StatusBanner>
      )}

      {removeFromPracticeStatus === "not_found" && (
        <StatusBanner tone="warning">
          That tune is no longer in active practice.
        </StatusBanner>
      )}

      {removeFromPracticeStatus === "error" && (
        <StatusBanner tone="error">
          Could not remove tune from practice.
        </StatusBanner>
      )}

      {deleteTuneStatus === "success" && (
        <StatusBanner tone="success">Canonical tune deleted.</StatusBanner>
      )}

      {deleteTuneStatus === "missing_piece" && (
        <StatusBanner tone="warning">
          Could not tell which canonical tune to delete.
        </StatusBanner>
      )}

      {deleteTuneStatus === "not_allowed" && (
        <StatusBanner tone="error">
          Only moderators can delete canonical tunes.
        </StatusBanner>
      )}

      {deleteTuneStatus === "not_found" && (
        <StatusBanner tone="warning">
          That tune could not be found. It may already have been deleted.
        </StatusBanner>
      )}

      {deleteTuneStatus === "confirmation_mismatch" && (
        <StatusBanner tone="error">
          Typed confirmation did not match. The canonical tune was not deleted.
        </StatusBanner>
      )}

      {deleteTuneStatus === "error" && (
        <StatusBanner tone="error">
          Could not delete canonical tune.
        </StatusBanner>
      )}

      {loopStatus === "saved" && (
        <StatusBanner tone="success">Loop saved.</StatusBanner>
      )}

      {loopStatus === "deleted" && (
        <StatusBanner tone="success">Loop deleted.</StatusBanner>
      )}

      {loopStatus === "missing_fields" && (
        <StatusBanner tone="warning">
          Could not save loop: missing label or video.
        </StatusBanner>
      )}

      {loopStatus === "invalid_range" && (
        <StatusBanner tone="warning">
          Could not save loop: choose a valid start and end point.
        </StatusBanner>
      )}

      {loopStatus === "missing_loop" && (
        <StatusBanner tone="warning">Could not find that saved loop.</StatusBanner>
      )}

      {loopStatus === "missing_piece" && (
        <StatusBanner tone="warning">Could not find that tune.</StatusBanner>
      )}

      {loopStatus === "error" && (
        <StatusBanner tone="error">Could not update loop.</StatusBanner>
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
        <div
          className={`mb-6 rounded-2xl border p-5 text-sm shadow-sm ${statusStyles.success}`}
        >
          <p className="font-semibold">Bulk import completed.</p>
          <p className="mt-2">
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
                className={buttonStyles.primary}
              >
                View Uploaded Tunes
              </Link>
            )}

            <Link href="/library/known" className={buttonStyles.secondary}>
              View Known Tunes
            </Link>

            <Link href="/library" className={buttonStyles.secondary}>
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
