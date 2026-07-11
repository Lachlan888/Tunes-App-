"use client"

import SubmitButton from "@/components/SubmitButton"
import { buttonStyles } from "@/components/ui/buttonStyles"
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
  confirmMessage = "Stop Practice for this tune? Review scheduling will stop. The tune will remain in any lists, the shared tune will not be deleted, and stopping Practice does not automatically mark it Known.",
  label = "Stop Practice",
  pendingLabel = "Stopping...",
  className = buttonStyles.destructiveSecondary,
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
