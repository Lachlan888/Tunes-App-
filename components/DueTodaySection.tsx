type Piece = {
  id: number
  title: string
  key: string | null
  style: string | null
  time_signature: string | null
}

type UserPiece = {
  id: number
  piece_id: number
  status: string
  next_review_due: string | null
}

type DueTodaySectionProps = {
  dueToday: UserPiece[] | null | undefined
  pieces: Piece[] | null | undefined
  markFailed: (formData: FormData) => Promise<void>
  markSolid: (formData: FormData) => Promise<void>
  markShaky: (formData: FormData) => Promise<void>
}

export default function DueTodaySection({
  dueToday,
  pieces,
  markFailed,
  markSolid,
  markShaky,
}: DueTodaySectionProps) {
  const items = dueToday ?? []

  return (
    <section className="mb-10">
      <h2 className="mb-4 text-2xl font-semibold">Due Today</h2>

      {items.length === 0 ? (
        <p className="text-gray-600">No tunes due today.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((userPiece) => {
            const piece = pieces?.find((p) => p.id === userPiece.piece_id)

            if (!piece) return null

            return (
              <li
                key={userPiece.id}
                className="flex items-center justify-between gap-4 rounded border p-3"
              >
                <span>
                  {piece.title}
                  {piece.key ? `, key ${piece.key}` : ""}
                  {piece.style ? `, ${piece.style}` : ""}
                  {piece.time_signature ? `, ${piece.time_signature}` : ""}
                </span>

                <div className="flex gap-2">
                  <form action={markFailed}>
                    <input
                      type="hidden"
                      name="userPieceId"
                      value={userPiece.id}
                    />
                    <button
                      type="submit"
                      className="rounded border px-2 py-1 text-sm"
                    >
                      Failed
                    </button>
                  </form>

                  <form action={markShaky}>
                    <input
                      type="hidden"
                      name="userPieceId"
                      value={userPiece.id}
                    />
                    <button
                      type="submit"
                      className="rounded border px-2 py-1 text-sm"
                    >
                      Shaky
                    </button>
                  </form>

                  <form action={markSolid}>
                    <input
                      type="hidden"
                      name="userPieceId"
                      value={userPiece.id}
                    />
                    <button
                      type="submit"
                      className="rounded border px-2 py-1 text-sm"
                    >
                      Solid
                    </button>
                  </form>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}