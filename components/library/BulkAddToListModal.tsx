"use client"

import Link from "next/link"
import { useState } from "react"
import SubmitButton from "@/components/SubmitButton"
import ResponsiveModal from "@/components/ui/ResponsiveModal"
import { buttonStyles } from "@/components/ui/buttonStyles"
import type { LearningList } from "@/lib/types"

type BulkAddToListModalProps = {
  selectedPieceIds: number[]
  learningLists: LearningList[] | null
  redirectTo: string
  addSelectedTunesToLearningLists: (formData: FormData) => Promise<void>
  onClose: () => void
}

const BULK_ADD_FORM_ID = "catalogue-bulk-add-to-list-form"

export default function BulkAddToListModal({
  selectedPieceIds,
  learningLists,
  redirectTo,
  addSelectedTunesToLearningLists,
  onClose,
}: BulkAddToListModalProps) {
  const [selectedListIds, setSelectedListIds] = useState<number[]>([])
  const [isPending, setIsPending] = useState(false)
  const lists = learningLists ?? []

  function toggleList(listId: number) {
    if (isPending) return
    setSelectedListIds((current) =>
      current.includes(listId)
        ? current.filter((candidate) => candidate !== listId)
        : [...current, listId]
    )
  }

  return (
    <ResponsiveModal
      isOpen
      onClose={() => {
        if (!isPending) onClose()
      }}
      closeDisabled={isPending}
      closeOnEscape={!isPending}
      closeOnOverlayClick={!isPending}
      mobileMode="sheet"
      desktopMaxWidth="md:max-w-md"
      title="Add selected tunes to List"
      description={`${selectedPieceIds.length} tune${selectedPieceIds.length === 1 ? "" : "s"} selected. Existing memberships will be kept without duplication.`}
      footer={
        lists.length > 0 ? (
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              className={buttonStyles.secondary}
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </button>
            <SubmitButton
              form={BULK_ADD_FORM_ID}
              label={`Add ${selectedPieceIds.length} tune${selectedPieceIds.length === 1 ? "" : "s"}`}
              pendingLabel="Adding tunes..."
              className={buttonStyles.primary}
              forcePending={isPending}
              disabled={selectedListIds.length === 0}
            />
          </div>
        ) : undefined
      }
    >
      {lists.length === 0 ? (
        <div className="space-y-4">
          <p className="text-sm leading-6 text-text-muted">
            Create a List first, then return to this selection.
          </p>
          <Link href="/learning-lists" className={buttonStyles.primary}>
            Go to Lists
          </Link>
        </div>
      ) : (
        <form
          id={BULK_ADD_FORM_ID}
          action={async (formData: FormData) => {
            setIsPending(true)
            await addSelectedTunesToLearningLists(formData)
          }}
        >
          <input type="hidden" name="redirect_to" value={redirectTo} />
          {selectedPieceIds.map((pieceId) => (
            <input key={pieceId} type="hidden" name="piece_ids" value={pieceId} />
          ))}

          <fieldset disabled={isPending}>
            <legend className="text-sm font-semibold text-text-primary">
              Choose one or more Lists
            </legend>
            <div className="mt-3 space-y-2">
              {lists.map((list) => {
                const checked = selectedListIds.includes(list.id)

                return (
                  <label
                    key={list.id}
                    className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-control border p-3 text-sm transition-colors ${
                      checked
                        ? "border-action-primary bg-action-primary/10 text-text-primary"
                        : "border-hairline bg-surface-paper text-text-primary hover:bg-surface-note"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="learning_list_ids"
                      value={list.id}
                      checked={checked}
                      onChange={() => toggleList(list.id)}
                      className="mt-0.5 h-5 w-5 accent-[var(--action-primary)]"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{list.name}</span>
                      {list.description ? (
                        <span className="mt-1 block text-xs leading-5 text-text-muted">
                          {list.description}
                        </span>
                      ) : null}
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>

        </form>
      )}
    </ResponsiveModal>
  )
}
