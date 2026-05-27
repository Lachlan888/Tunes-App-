import SubmitButton from "@/components/SubmitButton"
import { createPieceEditRequest } from "@/lib/actions/piece-edit-requests"
import { VALID_KEYS } from "@/lib/music/keys"
import type { Piece, StyleOption } from "@/lib/types"

type RequestTuneEditFormProps = {
  piece: Piece
  redirectTo: string
  styleOptions: StyleOption[]
}

const inputClassName =
  "w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"

export default function RequestTuneEditForm({
  piece,
  redirectTo,
  styleOptions,
}: RequestTuneEditFormProps) {
  return (
    <form action={createPieceEditRequest} className="space-y-3">
      <input type="hidden" name="piece_id" value={piece.id} />
      <input type="hidden" name="redirect_to" value={redirectTo} />

      <div className="rounded-2xl border border-border bg-background/70 p-4">
        <p className="text-sm font-medium text-foreground">
          Request a correction
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Suggest corrections to the shared tune record. To add background,
          source notes, alternate titles, or folklore, use the Lore section
          instead.
        </p>
      </div>

      <input
        name="title"
        placeholder={`Title, currently ${piece.title}`}
        className={inputClassName}
      />

      <select name="key" defaultValue="" className={inputClassName}>
        <option value="">Key, currently {piece.key || "missing"}</option>
        {VALID_KEYS.map((key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>

      <select name="style" defaultValue="" className={inputClassName}>
        <option value="">Style, currently {piece.style || "missing"}</option>
        {styleOptions.map((style) => (
          <option key={style.id} value={style.label}>
            {style.label}
          </option>
        ))}
      </select>

      <input
        name="time_signature"
        placeholder={`Time signature, currently ${
          piece.time_signature || "missing"
        }`}
        className={inputClassName}
      />

      <input
        name="composer"
        placeholder={`Composer, currently ${piece.composer || "missing"}`}
        className={inputClassName}
      />

      <input
        name="reference_url"
        type="url"
        placeholder="Reference URL"
        className={inputClassName}
      />

      <textarea
        name="reason"
        rows={5}
        placeholder="Why should this be changed?"
        className={inputClassName}
      />

      <SubmitButton
        label="Submit edit request"
        pendingLabel="Submitting..."
        className="w-full rounded-full border border-primary bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
      />
    </form>
  )
}
