import SubmitButton from "@/components/SubmitButton"

type StartPracticeButtonProps = {
  pieceId: number
  redirectTo: string
  startLearning: (formData: FormData) => Promise<void>
  label?: string
  pendingLabel?: string
  className?: string
}

export default function StartPracticeButton({
  pieceId,
  redirectTo,
  startLearning,
  label = "Start Practice",
  pendingLabel = "Starting...",
  className = "w-full border px-3 py-2 text-sm",
}: StartPracticeButtonProps) {
  return (
    <form action={startLearning}>
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