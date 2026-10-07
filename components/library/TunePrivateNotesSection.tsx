import SubmitButton from "@/components/SubmitButton"
import { buttonStyles } from "@/components/ui/buttonStyles"
import type { UserPieceMetadata } from "@/lib/loaders/tune-detail"

type TunePrivateNotesSectionProps = {
  pieceId: number
  redirectTo: string
  userPieceMetadata: UserPieceMetadata | null
  upsertUserPieceNotes: (formData: FormData) => Promise<void>
  showTopRule?: boolean
}

const inputClassName =
  "w-full rounded-control border border-hairline bg-surface-paper px-4 py-3 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:ring-2 focus:ring-[var(--focus-ring)]"

export default function TunePrivateNotesSection({
  pieceId,
  redirectTo,
  userPieceMetadata,
  upsertUserPieceNotes,
  showTopRule = true,
}: TunePrivateNotesSectionProps) {
  const hasNotes = Boolean(userPieceMetadata?.notes?.trim())
  const form = (
      <form action={upsertUserPieceNotes} className="mt-4 space-y-3">
        <input type="hidden" name="piece_id" value={pieceId} />
        <input type="hidden" name="redirect_to" value={redirectTo} />

        <textarea
          name="notes"
          aria-label="Private tune notes"
          defaultValue={userPieceMetadata?.notes || ""}
          rows={hasNotes ? 5 : 3}
          placeholder="Add your private notes for this tune"
          className={inputClassName}
        />

        <SubmitButton
          label="Save notes"
          pendingLabel="Saving..."
          className={buttonStyles.primary}
        />
      </form>
  )

  return (
    <section className={`${showTopRule ? "border-t border-hairline" : ""} py-6`}>
      <h2 className="text-xl font-bold tracking-tight text-text-primary">My notes</h2>
      {hasNotes ? form : <details className="mt-4"><summary className={`${buttonStyles.secondary} cursor-pointer list-none`}>Add private note</summary>{form}</details>}
    </section>
  )
}
