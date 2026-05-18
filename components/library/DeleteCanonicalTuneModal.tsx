"use client"

import { useState } from "react"
import SubmitButton from "@/components/SubmitButton"
import ResponsiveModal from "@/components/ui/ResponsiveModal"
import { buttonStyles } from "@/components/ui/buttonStyles"
import type { Piece } from "@/lib/types"

type DeleteCanonicalTuneModalProps = {
  piece: Piece
  redirectTo: string
  deleteCanonicalTuneAsModerator: (formData: FormData) => Promise<void>
  onClose: () => void
}

const inputClassName =
  "w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"

export default function DeleteCanonicalTuneModal({
  piece,
  redirectTo,
  deleteCanonicalTuneAsModerator,
  onClose,
}: DeleteCanonicalTuneModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const confirmationText = `DELETE ${piece.title}`

  function closeModal() {
    if (isDeleting) return
    onClose()
  }

  return (
    <ResponsiveModal
      isOpen
      onClose={closeModal}
      closeDisabled={isDeleting}
      closeOnOverlayClick={!isDeleting}
      closeOnEscape={!isDeleting}
      mobileMode="full-screen"
      desktopMaxWidth="md:max-w-2xl"
      tone="destructive"
      eyebrow="Moderator destructive action"
      title="Delete canonical tune"
      description="This permanently removes this tune from the shared catalogue for everyone. It may also remove connected practice state, known status, list entries, comments, lore, media links, moderation requests, and notifications."
    >
      <div className="space-y-5">
        <div className="rounded-2xl border border-border bg-background/70 p-4">
          <p className="text-sm text-muted-foreground">
            To confirm, type this exactly:
          </p>
          <p className="mt-2 break-words font-mono text-sm font-semibold text-foreground">
            {confirmationText}
          </p>
        </div>

        <form
          action={async (formData: FormData) => {
            setIsDeleting(true)
            await deleteCanonicalTuneAsModerator(formData)
          }}
          className="space-y-3"
        >
          <input type="hidden" name="piece_id" value={piece.id} />
          <input type="hidden" name="redirect_to" value={redirectTo} />

          <input
            name="confirmation"
            placeholder={confirmationText}
            className={inputClassName}
            autoComplete="off"
            required
            disabled={isDeleting}
          />

          <div className="grid gap-2 pt-2 sm:flex sm:flex-wrap">
            <SubmitButton
              label="Delete canonical tune"
              pendingLabel="Deleting..."
              className={`${buttonStyles.destructive} w-full sm:w-auto`}
            />

            <button
              type="button"
              onClick={closeModal}
              disabled={isDeleting}
              className={`${buttonStyles.secondary} w-full sm:w-auto`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </ResponsiveModal>
  )
}