import SubmitButton from "@/components/SubmitButton"
import { updateMissingPieceDetails } from "@/lib/actions/pieces"
import type { Piece } from "@/lib/types"

type StyleOption = {
  id: number
  slug: string
  label: string
}

type TuneCanonicalDetailsCardProps = {
  piece: Piece
  redirectTo: string
  styleOptions: StyleOption[]
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  return (
    <div className="rounded-2xl border border-border bg-background/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-medium text-foreground">
        {value || <span className="text-muted-foreground">Missing</span>}
      </p>
    </div>
  )
}

const inputClassName =
  "w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"

export default function TuneCanonicalDetailsCard({
  piece,
  redirectTo,
  styleOptions,
}: TuneCanonicalDetailsCardProps) {
  const missingFields = [
    !piece.key,
    !piece.style,
    !piece.time_signature,
    !piece.reference_url,
  ].filter(Boolean).length

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Tune details
      </h2>

      <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
        You can add missing canonical information here. Existing canonical
        details stay fixed. If you need a different key or version, create a
        separate tune entry.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <DetailRow label="Key" value={piece.key} />
        <DetailRow label="Style" value={piece.style} />
        <DetailRow label="Time signature" value={piece.time_signature} />
        <DetailRow label="Reference URL" value={piece.reference_url} />
      </div>

      {missingFields === 0 ? (
        <p className="mt-5 rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
          No canonical details are missing for this tune.
        </p>
      ) : (
        <form action={updateMissingPieceDetails} className="mt-5 space-y-3">
          <input type="hidden" name="piece_id" value={piece.id} />
          <input type="hidden" name="redirect_to" value={redirectTo} />

          {!piece.key && (
            <input
              name="key"
              placeholder='Add key, eg "D", "Dm" or "D Modal"'
              className={inputClassName}
            />
          )}

          {!piece.style && (
            <select
              name="style_id"
              defaultValue=""
              className={inputClassName}
            >
              <option value="">Choose style</option>
              {styleOptions.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.label}
                </option>
              ))}
            </select>
          )}

          {!piece.time_signature && (
            <input
              name="time_signature"
              placeholder='Add time signature, eg "4/4"'
              className={inputClassName}
            />
          )}

          {!piece.reference_url && (
            <input
              name="reference_url"
              type="url"
              placeholder="Add reference URL"
              className={inputClassName}
            />
          )}

          <SubmitButton
            label="Save missing details"
            pendingLabel="Saving..."
            className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          />
        </form>
      )}
    </section>
  )
}