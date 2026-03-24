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
}

export default function DueTodaySection({
  dueToday,
  pieces,
}: DueTodaySectionProps) {
  const items = dueToday ?? []

  return (
    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-4">Due Today</h2>

      {items.length === 0 ? (
        <p className="text-gray-600">No tunes due today.</p>
      ) : (
        <ul className="list-disc pl-6">
          {items.map((userPiece) => {
            const piece = pieces?.find((p) => p.id === userPiece.piece_id)

            if (!piece) return null

            return (
              <li key={userPiece.id}>
                {piece.title}
                {piece.key ? `, key ${piece.key}` : ""}
                {piece.style ? `, ${piece.style}` : ""}
                {piece.time_signature ? `, ${piece.time_signature}` : ""}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}