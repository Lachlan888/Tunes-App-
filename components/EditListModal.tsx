"use client"

import { useState } from "react"
import SubmitButton from "@/components/SubmitButton"
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
  triggerLabel?: string
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
  triggerLabel = "Manage List",
}: EditListModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isBusy, setIsBusy] = useState(false)

  function closeModal() {
    if (isBusy) return
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        className="rounded border px-3 py-1 text-sm"
        onClick={() => setIsOpen(true)}
      >
        {triggerLabel}
      </button>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={closeModal}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded bg-white p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Manage List</h2>
          <button
            type="button"
            className="rounded border px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            onClick={closeModal}
            disabled={isBusy}
          >
            Close
          </button>
        </div>

        <div className="space-y-8">
          <section>
            <h3 className="mb-3 text-lg font-semibold">List details</h3>

            <form
              action={async (formData: FormData) => {
                setIsBusy(true)
                await updateList(formData)
              }}
              className="space-y-3"
            >
              <input type="hidden" name="learning_list_id" value={listId} />
              <input type="hidden" name="redirect_to" value={redirectTo} />

              <div>
                <label className="mb-1 block text-sm font-medium">Name</label>
                <input
                  name="name"
                  defaultValue={name}
                  className="w-full rounded border p-2"
                  required
                  disabled={isBusy}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Description
                </label>
                <textarea
                  name="description"
                  defaultValue={description ?? ""}
                  className="w-full rounded border p-2"
                  rows={3}
                  disabled={isBusy}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Visibility
                </label>
                <select
                  name="visibility"
                  defaultValue={visibility}
                  className="w-full rounded border p-2"
                  disabled={isBusy}
                >
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </div>

              <SubmitButton
                label="Save List Details"
                pendingLabel="Saving..."
                className="rounded bg-black px-4 py-2 text-sm text-white"
              />
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
                    className="flex items-center justify-between gap-3 rounded border p-3"
                  >
                    <div className="text-sm">
                      <div className="font-medium">{tune.title}</div>
                      <div className="text-gray-600">
                        {[tune.key ? `Key ${tune.key}` : null, tune.style, tune.time_signature]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    </div>

                    <form
                      action={async (formData: FormData) => {
                        setIsBusy(true)
                        await removeTuneFromList(formData)
                      }}
                    >
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
                      <SubmitButton
                        label="Remove from List"
                        pendingLabel="Removing..."
                        className="rounded border px-3 py-1 text-sm"
                      />
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
              action={async (formData: FormData) => {
                const confirmed = window.confirm(
                  "Delete this list? This will remove the list and its contents, but it will not delete the tunes from your app."
                )

                if (!confirmed) return

                setIsBusy(true)
                await deleteList(formData)
              }}
            >
              <input type="hidden" name="learning_list_id" value={listId} />
              <input type="hidden" name="redirect_to" value="/learning-lists" />
              <SubmitButton
                label="Delete List"
                pendingLabel="Deleting..."
                className="rounded border border-red-600 px-3 py-1 text-sm text-red-700"
              />
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}