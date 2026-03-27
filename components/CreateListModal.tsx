"use client"

import { useState } from "react"
import CreateListForm from "@/components/CreateListForm"
import { createList } from "@/lib/actions/lists"

export default function CreateListModal() {
  const [isOpen, setIsOpen] = useState(false)

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold">Create List</h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-sm underline"
              >
                Close
              </button>
            </div>

            <CreateListForm createList={createList} redirectTo="/learning-lists" />
          </div>
        </div>
      )}
    </section>
  )
}