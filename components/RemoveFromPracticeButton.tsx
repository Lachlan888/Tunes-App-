"use client"

import SubmitButton from "@/components/SubmitButton"
import { removeFromPractice } from "@/lib/actions/user-pieces"

type RemoveFromPracticeButtonProps = {
  userPieceId: number
  redirectTo: string
  confirmMessage?: string
  label?: string
  pendingLabel?: string
  className?: string
}

export default function RemoveFromPracticeButton({
  userPieceId,
  redirectTo,
  confirmMessage = "Remove this tune from your practice system? It will stay in your lists and known tunes.",
  label = "Remove from Practice",
  pendingLabel = "Removing...",
  className = "rounded-md border px-4 py-2 text-sm font-medium",
}: RemoveFromPracticeButtonProps) {
  return (
    <form
      action={removeFromPractice}
      onSubmit={(event) => {
        const confirmed = window.confirm(confirmMessage)

        if (!confirmed) {
          event.preventDefault()
        }
      }}
    >
      <input type="hidden" name="user_piece_id" value={userPieceId} />
      <input type="hidden" name="redirect_to" value={redirectTo} />
      <SubmitButton
        label={label}
        pendingLabel={pendingLabel}
        className={className}
      />
    </form>
  )
}