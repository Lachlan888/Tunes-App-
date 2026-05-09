"use client"

import { useEffect, useState } from "react"
import CreateTuneForm from "@/components/library/CreateTuneForm"
import { buttonStyles } from "@/components/ui/buttonStyles"
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
        className={buttonStyles.primary}
      >
        Create Tune
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/35 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!isSubmitting) {
              setIsOpen(false)
            }
          }}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-6 py-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Catalogue
                </p>
                <h2 className="mt-2 font-serif text-3xl font-bold text-foreground">
                  Create Tune
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Add a tune to the shared catalogue, then optionally place it
                  straight into your own repertoire workflow.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
                className={buttonStyles.secondary}
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