"use client"

import { useEffect, useState } from "react"
import CreateListForm from "@/components/lists/CreateListForm"
import { buttonStyles } from "@/components/ui/buttonStyles"
import { createList } from "@/lib/actions/lists"

export default function CreateListModal() {
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
        Create List
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-foreground/35 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!isSubmitting) {
              setIsOpen(false)
            }
          }}
        >
          <div className="flex min-h-full items-start justify-center py-8">
            <div
              className="w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-lg"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Lists
                  </p>
                  <h2 className="mt-2 font-serif text-3xl font-bold text-foreground">
                    Create List
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Make a container for repertoire, practice plans, session
                    sets, or imported tune groups.
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

              <CreateListForm
                createList={createList}
                redirectTo="/learning-lists"
                onSubmitStart={() => setIsSubmitting(true)}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}