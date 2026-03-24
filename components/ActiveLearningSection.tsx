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
}

type ActiveLearningSectionProps = {
  userPieces: UserPiece[] | null
  pieces: Piece[] | null
}

export default function ActiveLearningSection({
  userPieces,
  pieces,
}: ActiveLearningSectionProps) {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-4">Active Learning</h2>

      {!userPieces || userPieces.length === 0 ? (
        <p className="text-gray-600">No tunes in active learning yet.</p>
      ) : (
        <ul className="list-disc pl-6">
          {userPieces.map((userPiece: UserPiece) => {
            const piece = pieces?.find((piece: Piece) => piece.id === userPiece.piece_id)

            if (!piece) return null

            return (
              <li key={userPiece.id}>
                {piece.title}
                {piece.key ? `, key ${piece.key}` : ""}
                {piece.style ? `, ${piece.style}` : ""}
                {piece.time_signature ? `, ${piece.time_signature}` : ""}
                {userPiece.status ? `, status: ${userPiece.status}` : ""}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}