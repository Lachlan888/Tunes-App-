"use client"

import { useEffect, useState } from "react"
import CreateListForm from "@/components/lists/CreateListForm"
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
        className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
      >
        Create List
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-[#20271c]/55 p-4"
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
                  className="rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
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