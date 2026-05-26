"use client"

import { useState } from "react"
import PendingLinkButton from "@/components/PendingLinkButton"
import SubmitButton from "@/components/SubmitButton"
import ResponsiveModal from "@/components/ui/ResponsiveModal"
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
  triggerClassName?: string
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
  triggerClassName = buttonStyles.secondary,
}: EditListModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isBusy, setIsBusy] = useState(false)

  function closeModal() {
    if (isBusy) return
    setIsOpen(false)
  }

  const nextVisibility = visibility === "public" ? "private" : "public"
  const visibilityLabel =
    visibility === "public" ? "Make Private" : "Make Public"

  return (
    <>
      <button
        type="button"
        className={triggerClassName}
        onClick={() => {
          setIsBusy(false)
          setIsOpen(true)
        }}
      >
        {triggerLabel}
      </button>

      <ResponsiveModal
        isOpen={isOpen}
        onClose={closeModal}
        closeDisabled={isBusy}
        closeOnOverlayClick={!isBusy}
        closeOnEscape={!isBusy}
        mobileMode="full-screen"
        desktopMaxWidth="md:max-w-2xl"
        eyebrow="Lists"
        title="Manage List"
        description="Edit this list container, remove tunes from this list only, or delete the list."
        bodyClassName="min-h-0 flex-1 overflow-y-auto p-5 md:p-6"
      >
        <div className="space-y-8">
          <section>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  List details
                </h3>

                <p className="mt-2 text-sm font-medium text-muted-foreground">
                  {visibility === "public" ? "Public" : "Private"}
                </p>
              </div>

              <form
                action={async (formData: FormData) => {
                  setIsBusy(true)
                  await updateList(formData)
                }}
              >
                <input type="hidden" name="learning_list_id" value={listId} />
                <input type="hidden" name="redirect_to" value={redirectTo} />
                <input type="hidden" name="name" value={name} />
                <input
                  type="hidden"
                  name="description"
                  value={description ?? ""}
                />
                <input
                  type="hidden"
                  name="visibility"
                  value={nextVisibility}
                />

                <SubmitButton
                  label={visibilityLabel}
                  pendingLabel="Saving..."
                  className={buttonStyles.secondary}
                />
              </form>
            </div>

            <form
              action={async (formData: FormData) => {
                setIsBusy(true)
                await updateList(formData)
              }}
              className="mt-4 space-y-4"
            >
              <input type="hidden" name="learning_list_id" value={listId} />
              <input type="hidden" name="redirect_to" value={redirectTo} />
              <input type="hidden" name="visibility" value={visibility} />

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
              <div className="mt-4 divide-y divide-border/70 border-y border-border/70 md:space-y-2 md:divide-y-0 md:border-y-0">
                {tunes.map((tune) => (
                  <div
                    key={tune.id}
                    className="flex flex-col gap-3 py-4 md:rounded-2xl md:border md:border-border md:bg-background/70 md:p-4 sm:flex-row sm:items-center sm:justify-between"
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

          <section className={`rounded-2xl border p-4 ${statusStyles.error}`}>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em]">
              Danger zone
            </h3>

            <p className="mt-2 text-sm leading-6">
              Delete this list container. This removes the list and its list
              memberships only. It will not delete the tunes from your app.
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
      </ResponsiveModal>
    </>
  )
}
