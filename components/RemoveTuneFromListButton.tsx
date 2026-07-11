"use client"

import SubmitButton from "@/components/SubmitButton"
import { buttonStyles } from "@/components/ui/buttonStyles"
import { removeTuneFromList } from "@/lib/actions/lists"

type RemoveTuneFromListButtonProps = {
  listId: number
  pieceId: number
  tuneTitle: string
  redirectTo: string
  label?: string
  pendingLabel?: string
  className?: string
}

export default function RemoveTuneFromListButton({
  listId,
  pieceId,
  tuneTitle,
  redirectTo,
  label = "Remove from this list",
  pendingLabel = "Removing...",
  className = buttonStyles.secondary,
}: RemoveTuneFromListButtonProps) {
  return (
    <form
      action={removeTuneFromList}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `Remove "${tuneTitle}" from this list? This only removes the list membership. Known state, Practice state, other lists, and the shared tune will not be changed.`
        )

        if (!confirmed) {
          event.preventDefault()
        }
      }}
    >
      <input type="hidden" name="learning_list_id" value={listId} />
      <input type="hidden" name="piece_id" value={pieceId} />
      <input type="hidden" name="redirect_to" value={redirectTo} />

      <SubmitButton
        label={label}
        pendingLabel={pendingLabel}
        className={className}
      />
    </form>
  )
}
