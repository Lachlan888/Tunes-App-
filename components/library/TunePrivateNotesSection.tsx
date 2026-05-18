import SubmitButton from "@/components/SubmitButton"
import { buttonStyles } from "@/components/ui/buttonStyles"
import type { UserPieceMetadata } from "@/lib/loaders/tune-detail"

type TunePrivateNotesSectionProps = {
  pieceId: number
  redirectTo: string
  userPieceMetadata: UserPieceMetadata | null
  upsertUserPieceNotes: (formData: FormData) => Promise<void>
}

const inputClassName =
  "w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"

export default function TunePrivateNotesSection({
  pieceId,
  redirectTo,
  userPieceMetadata,
  upsertUserPieceNotes,
}: TunePrivateNotesSectionProps) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        My notes
      </h2>

      <form action={upsertUserPieceNotes} className="mt-5 space-y-3">
        <input type="hidden" name="piece_id" value={pieceId} />
        <input type="hidden" name="redirect_to" value={redirectTo} />

        <textarea
          name="notes"
          defaultValue={userPieceMetadata?.notes || ""}
          rows={8}
          placeholder="Add your private notes for this tune"
          className={inputClassName}
        />

        <SubmitButton
          label="Save notes"
          pendingLabel="Saving..."
          className={buttonStyles.primary}
        />
      </form>
    </section>
  )
}