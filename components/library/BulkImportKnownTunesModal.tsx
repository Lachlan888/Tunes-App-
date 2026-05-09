"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import SubmitButton from "@/components/SubmitButton"
import { buttonStyles } from "@/components/ui/buttonStyles"
import { uploadKnownTunesCsv } from "@/lib/actions/bulk-import"

export default function BulkImportKnownTunesModal() {
  const searchParams = useSearchParams()

  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFileName, setSelectedFileName] = useState("")
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false)
  const [hasHandledAutoOpen, setHasHandledAutoOpen] = useState(false)

  useEffect(() => {
    if (hasHandledAutoOpen) return

    if (searchParams.get("import") === "known") {
      setIsOpen(true)
      setHasHandledAutoOpen(true)
    }
  }, [hasHandledAutoOpen, searchParams])

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
    <section>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={buttonStyles.secondary}
      >
        Bulk Import Known Tunes
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-foreground/35 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div className="flex min-h-full items-start justify-center py-8">
            <div
              className="w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-lg"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Import
                  </p>
                  <h2 className="mt-2 font-serif text-3xl font-bold text-foreground">
                    Bulk Import Known Tunes
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className={buttonStyles.secondary}
                >
                  Close
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2 text-sm leading-6 text-muted-foreground">
                  <p>
                    Upload a CSV of tunes you already know. We’ll add them to
                    your known tunes and place them in your Uploaded Tunes list.
                  </p>
                  <p>
                    This is the quickest way to make the app useful: your known
                    tunes will count as repertoire immediately, without putting
                    everything into practice.
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-background/70 p-4 text-sm">
                  <p className="font-medium">CSV template</p>
                  <p className="mt-1 text-muted-foreground">
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
                    className={`${buttonStyles.primary} ${
                      isSubmitting ? "pointer-events-none opacity-50" : ""
                    }`}
                  >
                    {isDownloadingTemplate
                      ? "Downloading..."
                      : "Download Template"}
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
                      className={`inline-block ${buttonStyles.secondary} ${
                        isSubmitting
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }`}
                    >
                      {selectedFileName ? "Change CSV File" : "Select CSV File"}
                    </label>
                  </div>

                  {selectedFileName && (
                    <p className="text-sm text-muted-foreground">
                      Selected file: {selectedFileName}
                    </p>
                  )}

                  <SubmitButton
                    label="Import Known Tunes"
                    pendingLabel="Importing tunes..."
                    className={buttonStyles.primary}
                  />
                </form>

                <p className="text-sm leading-6 text-muted-foreground">
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