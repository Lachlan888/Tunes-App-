"use client"

import { useState } from "react"
import CreateTuneForm from "@/components/CreateTuneForm"
import { createTune } from "@/lib/actions/pieces"

export default function CreateTuneModal() {
  const [isOpen, setIsOpen] = useState(false)

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold">Create Tune</h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-sm underline"
              >
                Close
              </button>
            </div>

            <CreateTuneForm createTune={createTune} redirectTo="/library" />
          </div>
        </div>
      )}
    </section>
  )
}