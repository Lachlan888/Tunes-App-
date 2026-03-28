"use client"

type RemoveTuneButtonProps = {
  pieceId: number
  redirectTo: string
  removeTuneFromMyApp: (formData: FormData) => Promise<void>
}

export default function RemoveTuneButton({
  pieceId,
  redirectTo,
  removeTuneFromMyApp,
}: RemoveTuneButtonProps) {
  return (
    <form
      action={removeTuneFromMyApp}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          "Remove this tune from your practice, known tunes, and all your lists?"
        )

        if (!confirmed) {
          event.preventDefault()
        }
      }}
    >
      <input type="hidden" name="piece_id" value={pieceId} />
      <input type="hidden" name="redirect_to" value={redirectTo} />
      <button className="border px-3 py-1 text-sm">Remove Tune</button>
    </form>
  )
}