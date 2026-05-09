"use client"

import { useState } from "react"
import PendingLinkButton from "@/components/PendingLinkButton"
import SubmitButton from "@/components/SubmitButton"
import { buttonStyles } from "@/components/ui/buttonStyles"
import { statusStyles } from "@/components/ui/statusStyles"
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

const inputClass =
  "w-full rounded-xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"

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
        className={buttonStyles.secondary}
        onClick={() => setIsOpen(true)}
      >
        {triggerLabel}
      </button>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/35 p-4 backdrop-blur-sm"
      onClick={closeModal}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Lists
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-foreground">
              Manage List
            </h2>
          </div>

          <button
            type="button"
            className={buttonStyles.secondary}
            onClick={closeModal}
            disabled={isBusy}
          >
            Close
          </button>
        </div>

        <div className="space-y-8">
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              List details
            </h3>

            <form
              action={async (formData: FormData) => {
                setIsBusy(true)
                await updateList(formData)
              }}
              className="mt-4 space-y-4"
            >
              <input type="hidden" name="learning_list_id" value={listId} />
              <input type="hidden" name="redirect_to" value={redirectTo} />

              <div>
                <label className="mb-2 block text-sm font-medium">Name</label>
                <input
                  name="name"
                  defaultValue={name}
                  className={inputClass}
                  required
                  disabled={isBusy}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>
                <textarea
                  name="description"
                  defaultValue={description ?? ""}
                  className={inputClass}
                  rows={3}
                  disabled={isBusy}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Visibility
                </label>
                <select
                  name="visibility"
                  defaultValue={visibility}
                  className={inputClass}
                  disabled={isBusy}
                >
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </div>

              <SubmitButton
                label="Save List Details"
                pendingLabel="Saving..."
                className={buttonStyles.primary}
              />
            </form>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Tunes in this list
            </h3>

            {tunes.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                This list has no tunes.
              </p>
            ) : (
              <div className="mt-4 space-y-2">
                {tunes.map((tune) => (
                  <div
                    key={tune.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background/70 p-4"
                  >
                    <div className="min-w-0 text-sm">
                      <PendingLinkButton
                        href={`/library/${tune.id}`}
                        label={tune.title}
                        pendingLabel={`Opening ${tune.title}...`}
                        className="cursor-pointer text-left font-medium underline underline-offset-4"
                      />
                      <div className="mt-1 text-muted-foreground">
                        {[
                          tune.key ? `Key ${tune.key}` : null,
                          tune.style,
                          tune.time_signature,
                        ]
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
                        className={buttonStyles.secondary}
                      />
                    </form>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section
            className={`rounded-2xl border p-4 ${statusStyles.error}`}
          >
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em]">
              Danger zone
            </h3>
            <p className="mt-2 text-sm leading-6">
              Delete this list container. This will not delete the tunes from
              your app.
            </p>

            <form
              action={async (formData: FormData) => {
                const confirmed = window.confirm(
                  "Delete this list? This will remove the list and its contents, but it will not delete the tunes from your app."
                )

                if (!confirmed) return

                setIsBusy(true)
                await deleteList(formData)
              }}
              className="mt-4"
            >
              <input type="hidden" name="learning_list_id" value={listId} />
              <input type="hidden" name="redirect_to" value="/learning-lists" />
              <SubmitButton
                label="Delete List"
                pendingLabel="Deleting..."
                className={buttonStyles.destructiveSecondary}
              />
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}