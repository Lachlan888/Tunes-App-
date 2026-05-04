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
    <section className="rounded border p-4">
      <h2 className="mb-2 text-xl font-semibold">Tune details</h2>
      <p className="mb-4 text-sm text-gray-600">
        You can add missing canonical information here. Existing canonical
        details stay fixed. If you need a different key or version, create a
        separate tune entry, for example &quot;Cannonball Rag in A&quot;.
      </p>

      <div className="mb-4 space-y-2 text-sm text-gray-700">
        <p>
          Key:{" "}
          {piece.key ? (
            <span>{piece.key}</span>
          ) : (
            <span className="text-gray-500">Missing</span>
          )}
        </p>
        <p>
          Style:{" "}
          {piece.style ? (
            <span>{piece.style}</span>
          ) : (
            <span className="text-gray-500">Missing</span>
          )}
        </p>
        <p>
          Time signature:{" "}
          {piece.time_signature ? (
            <span>{piece.time_signature}</span>
          ) : (
            <span className="text-gray-500">Missing</span>
          )}
        </p>
        <p>
          Reference URL:{" "}
          {piece.reference_url ? (
            <span className="break-all">{piece.reference_url}</span>
          ) : (
            <span className="text-gray-500">Missing</span>
          )}
        </p>
      </div>

      {missingFields === 0 ? (
        <p className="text-sm text-gray-600">
          No canonical details are missing for this tune.
        </p>
      ) : (
        <form action={updateMissingPieceDetails} className="space-y-3">
          <input type="hidden" name="piece_id" value={piece.id} />
          <input type="hidden" name="redirect_to" value={redirectTo} />

          {!piece.key && (
            <input
              name="key"
              placeholder='Add key, eg "D", "Dm" or "D Modal"'
              className="w-full border p-2"
            />
          )}

          {!piece.style && (
            <select
              name="style_id"
              defaultValue=""
              className="w-full border p-2"
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
              className="w-full border p-2"
            />
          )}

          {!piece.reference_url && (
            <input
              name="reference_url"
              type="url"
              placeholder="Add reference URL"
              className="w-full border p-2"
            />
          )}

          <SubmitButton
            label="Save missing details"
            pendingLabel="Saving..."
            className="w-full border px-3 py-2 text-sm"
          />
        </form>
      )}
    </section>
  )
}