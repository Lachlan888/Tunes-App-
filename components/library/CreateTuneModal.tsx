"use client"

import { useEffect, useState } from "react"
import CreateTuneForm from "@/components/library/CreateTuneForm"
import { createTune } from "@/lib/actions/pieces"

type StyleOption = {
  id: number
  slug: string
  label: string
}

type LearningListOption = {
  id: number
  name: string
}

type CreateTuneModalProps = {
  styleOptions: StyleOption[]
  learningLists: LearningListOption[]
}

export default function CreateTuneModal({
  styleOptions,
  learningLists,
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
    <section>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded bg-black px-4 py-2 text-white"
      >
        Create Tune
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => {
            if (!isSubmitting) {
              setIsOpen(false)
            }
          }}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b px-6 py-4">
              <div>
                <h2 className="text-2xl font-semibold">Create Tune</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Add a tune to the shared catalogue, then optionally place it
                  straight into your own repertoire workflow.
                </p>
              </div>

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
              learningLists={learningLists}
              redirectTo="/library"
              onSubmitStart={() => setIsSubmitting(true)}
            />
          </div>
        </div>
      )}
    </section>
  )
}