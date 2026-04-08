import SubmitButton from "@/components/SubmitButton"
import { markAsKnown } from "@/lib/actions/known-pieces"

type MarkAsKnownButtonProps = {
  pieceId: number
  redirectTo: string
  label?: string
  pendingLabel?: string
  className?: string
}

export default function MarkAsKnownButton({
  pieceId,
  redirectTo,
  label = "Mark as known",
  pendingLabel = "Saving...",
  className = "w-full border px-3 py-2 text-sm",
}: MarkAsKnownButtonProps) {
  return (
    <form action={markAsKnown}>
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