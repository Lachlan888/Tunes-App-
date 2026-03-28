"use client"

import { useState } from "react"
import type { Piece } from "@/lib/types"

type EditListModalProps = {
  listId: number
  name: string
  description: string | null
  visibility: "private" | "public"
  redirectTo: string
  tunes: Piece[]
  updateList: (formData: FormData) => Promise<void>
  removeTuneFromList: (formData: FormData) => Promise<void>
  deleteList: (formData: FormData) => Promise<void>
}

export default function EditListModal({
  listId,
  name,
  description,
  visibility,
  redirectTo,
  tunes,
  updateList,
  removeTuneFromList,
  deleteList,
}: EditListModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!isOpen) {
    return (
      <button
        type="button"
        className="border px-3 py-1 text-sm"
        onClick={() => setIsOpen(true)}
      >
        Edit List
      </button>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded bg-white p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Edit List</h2>
          <button
            type="button"
            className="border px-3 py-1 text-sm"
            onClick={() => setIsOpen(false)}
          >
            Close
          </button>
        </div>

        <div className="space-y-8">
          <section>
            <h3 className="mb-3 text-lg font-semibold">List details</h3>

            <form action={updateList} className="space-y-3">
              <input type="hidden" name="learning_list_id" value={listId} />
              <input type="hidden" name="redirect_to" value={redirectTo} />

              <div>
                <label className="mb-1 block text-sm font-medium">Name</label>
                <input
                  name="name"
                  defaultValue={name}
                  className="w-full border p-2"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Description
                </label>
                <textarea
                  name="description"
                  defaultValue={description ?? ""}
                  className="w-full border p-2"
                  rows={3}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Visibility
                </label>
                <select
                  name="visibility"
                  defaultValue={visibility}
                  className="w-full border p-2"
                >
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </div>

              <button className="bg-black px-4 py-2 text-sm text-white">
                Save List Details
              </button>
            </form>
          </section>

          <section>
            <h3 className="mb-3 text-lg font-semibold">Tunes in this list</h3>

            {tunes.length === 0 ? (
              <p className="text-sm text-gray-600">This list has no tunes.</p>
            ) : (
              <div className="space-y-2">
                {tunes.map((tune) => (
                  <div
                    key={tune.id}
                    className="flex items-center justify-between gap-3 border p-3"
                  >
                    <div className="text-sm">
                      <div className="font-medium">{tune.title}</div>
                      <div className="text-gray-600">
                        {[
                          tune.key ? `Key ${tune.key}` : null,
                          tune.style,
                          tune.time_signature,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    </div>

                    <form action={removeTuneFromList}>
                      <input
                        type="hidden"
                        name="learning_list_id"
                        value={listId}
                      />
                      <input type="hidden" name="piece_id" value={tune.id} />
                      <input
                        type="hidden"
                        name="redirect_to"
                        value={redirectTo}
                      />
                      <button className="border px-3 py-1 text-sm">
                        Remove from List
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h3 className="mb-3 text-lg font-semibold text-red-700">
              Danger zone
            </h3>

            <form
              action={deleteList}
              onSubmit={(event) => {
                const confirmed = window.confirm(
                  "Delete this list? This will remove the list and its contents, but it will not delete the tunes from your app."
                )

                if (!confirmed) {
                  event.preventDefault()
                }
              }}
            >
              <input type="hidden" name="learning_list_id" value={listId} />
              <input type="hidden" name="redirect_to" value="/learning-lists" />
              <button className="border border-red-600 px-3 py-1 text-sm text-red-700">
                Delete List
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}