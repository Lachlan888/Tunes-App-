"use client"

import { useEffect, useState } from "react"
import SubmitButton from "@/components/SubmitButton"
import { uploadKnownTunesCsv } from "@/lib/actions/bulk-import"

export default function BulkImportKnownTunesModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFileName, setSelectedFileName] = useState("")
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false)

  useEffect(() => {
    if (!isOpen || isSubmitting) return

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
        setSelectedFileName("")
      }
    }

    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, isSubmitting])

  function closeModal() {
    if (isSubmitting) return
    setIsOpen(false)
    setSelectedFileName("")
    setIsDownloadingTemplate(false)
  }

  function handleTemplateDownloadClick() {
    setIsDownloadingTemplate(true)

    window.setTimeout(() => {
      setIsDownloadingTemplate(false)
    }, 1200)
  }

  return (
    <section className="mb-6">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded bg-black px-4 py-2 text-white"
      >
        Bulk Import Known Tunes
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4"
          onClick={closeModal}
        >
          <div className="flex min-h-full items-start justify-center py-8">
            <div
              className="w-full max-w-xl rounded-lg bg-white p-6 shadow-lg"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-2xl font-semibold">
                  Bulk Import Known Tunes
                </h2>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="rounded border px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Close
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Upload a CSV of tunes you already know. We’ll add them to your
                  known tunes and place them in your Uploaded Tunes list.
                </p>

                <div className="rounded border bg-gray-50 p-3 text-sm">
                  <p className="font-medium">CSV template</p>
                  <p className="mt-1 text-gray-700">
                    Use these columns in this exact order: title, key, style,
                    time_signature, reference_url
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <a
                    href="/bulk-known-tunes-template.csv"
                    download
                    onClick={handleTemplateDownloadClick}
                    aria-disabled={isSubmitting}
                    className={`rounded bg-black px-4 py-2 text-sm text-white ${
                      isSubmitting ? "pointer-events-none opacity-50" : ""
                    }`}
                  >
                    {isDownloadingTemplate ? "Downloading..." : "Download Template"}
                  </a>
                </div>

                <form
                  action={async (formData: FormData) => {
                    setIsSubmitting(true)
                    await uploadKnownTunesCsv(formData)
                  }}
                  className="space-y-3"
                >
                  <input type="hidden" name="redirect_to" value="/library" />

                  <div>
                    <p className="mb-2 text-sm font-medium">
                      Choose completed CSV
                    </p>

                    <input
                      id="csv_file"
                      name="csv_file"
                      type="file"
                      accept=".csv,text/csv"
                      required
                      disabled={isSubmitting}
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        setSelectedFileName(file ? file.name : "")
                      }}
                      className="sr-only"
                    />

                    <label
                      htmlFor="csv_file"
                      aria-disabled={isSubmitting}
                      className={`inline-block rounded bg-black px-4 py-2 text-sm text-white ${
                        isSubmitting
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }`}
                    >
                      {selectedFileName ? "Change CSV File" : "Select CSV File"}
                    </label>
                  </div>

                  {selectedFileName && (
                    <p className="text-sm text-gray-600">
                      Selected file: {selectedFileName}
                    </p>
                  )}

                  <SubmitButton
                    label="Import Known Tunes"
                    pendingLabel="Importing tunes..."
                    className="rounded border px-4 py-2 text-sm disabled:opacity-50"
                  />
                </form>

                <p className="text-sm text-gray-500">
                  We’ll check the file format, match existing tunes where
                  possible, create missing tunes, add them to your known tunes,
                  and place them in Uploaded Tunes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}