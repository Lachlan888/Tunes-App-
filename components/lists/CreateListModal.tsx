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
    <section className="mb-6">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded bg-black px-4 py-2 text-white"
      >
        Create List
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
                <h2 className="text-2xl font-semibold">Create List</h2>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="rounded border px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
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