"use client"

import { useRef, useState } from "react"
import { uploadKnownTunesCsv } from "@/lib/actions/bulk-import"

export default function BulkImportKnownTunesModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFileName, setSelectedFileName] = useState("")
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold">
                Bulk Import Known Tunes
              </h2>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  setSelectedFileName("")
                }}
                className="text-sm underline"
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Upload a CSV of tunes you already know. This will add them as
                known tunes without starting practice or scheduling reviews.
              </p>

              <div className="rounded border bg-gray-50 p-3 text-sm">
                <p className="font-medium">Template columns</p>
                <p className="mt-1 text-gray-700">
                  title, key, style, time_signature, reference_url
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href="/bulk-known-tunes-template.csv"
                  download
                  className="rounded bg-black px-4 py-2 text-sm text-white"
                >
                  Download CSV Template
                </a>
              </div>

              <form action={uploadKnownTunesCsv} className="space-y-3">
                <input type="hidden" name="redirect_to" value="/library" />

                <div>
                  <p className="mb-2 text-sm font-medium">Choose CSV file</p>

                  <input
                    ref={fileInputRef}
                    id="csv_file"
                    name="csv_file"
                    type="file"
                    accept=".csv,text/csv"
                    required
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      setSelectedFileName(file ? file.name : "")
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded bg-black px-4 py-2 text-sm text-white"
                  >
                    Choose CSV File
                  </button>
                </div>

                {selectedFileName && (
                  <p className="text-sm text-gray-600">
                    Selected file: {selectedFileName}
                  </p>
                )}

                <button
                  type="submit"
                  className="rounded border px-4 py-2 text-sm"
                  disabled={!selectedFileName}
                >
                  Upload CSV
                </button>
              </form>

              <p className="text-sm text-gray-500">
                This step only checks that the file is present and looks like a
                CSV.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}