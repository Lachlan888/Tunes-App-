"use client"

import SubmitButton from "@/components/SubmitButton"
import { removeTuneFromMyApp } from "@/lib/actions/pieces"

type RemoveTuneButtonProps = {
  pieceId: number
  redirectTo: string
  confirmMessage?: string
  label?: string
  pendingLabel?: string
  className?: string
}

export default function RemoveTuneButton({
  pieceId,
  redirectTo,
  confirmMessage = "Remove this tune from your practice, known tunes, and all your lists?",
  label = "Remove Tune",
  pendingLabel = "Removing...",
  className = "rounded-full border border-destructive bg-background/70 px-4 py-2 text-sm font-medium text-destructive shadow-sm transition hover:bg-destructive hover:text-destructive-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]",
}: RemoveTuneButtonProps) {
  return (
    <form
      action={removeTuneFromMyApp}
      onSubmit={(event) => {
        const confirmed = window.confirm(confirmMessage)

        if (!confirmed) {
          event.preventDefault()
        }
      }}
    >
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