"use client"

import { useEffect, useState } from "react"
import CreateTuneForm from "@/components/CreateTuneForm"
import { createTune } from "@/lib/actions/pieces"

type StyleOption = {
  id: number
  slug: string
  label: string
}

type CreateTuneModalProps = {
  styleOptions: StyleOption[]
}

export default function CreateTuneModal({
  styleOptions,
}: CreateTuneModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen || isSubmitting) return

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, isSubmitting])

  return (
    <section className="mb-6">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded bg-black px-4 py-2 text-white"
      >
        Create Tune
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4"
          onClick={() => {
            if (!isSubmitting) {
              setIsOpen(false)
            }
          }}
        >
          <div className="flex min-h-full items-start justify-center py-8">
            <div
              className="w-full max-w-xl rounded-lg bg-white p-6 shadow-lg"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-2xl font-semibold">Create Tune</h2>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="rounded border px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Close
                </button>
              </div>

              <CreateTuneForm
                createTune={createTune}
                styleOptions={styleOptions}
                redirectTo="/library"
                onSubmitStart={() => setIsSubmitting(true)}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}