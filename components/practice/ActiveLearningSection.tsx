import PracticeProgress from "@/components/practice/PracticeProgress"

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
  stage: number
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
      <h2 className="mb-4 text-2xl font-semibold">In Practice</h2>

      {!userPieces || userPieces.length === 0 ? (
        <p className="text-gray-600">No tunes in practice yet.</p>
      ) : (
        <ul className="space-y-3">
          {userPieces.map((userPiece: UserPiece) => {
            const piece = pieces?.find(
              (candidatePiece: Piece) => candidatePiece.id === userPiece.piece_id
            )

            if (!piece) return null

            return (
              <li key={userPiece.id} className="rounded border p-3">
                <p className="font-medium">
                  {piece.title}
                  {piece.key ? `, key ${piece.key}` : ""}
                  {piece.style ? `, ${piece.style}` : ""}
                  {piece.time_signature ? `, ${piece.time_signature}` : ""}
                </p>

                <PracticeProgress stage={userPiece.stage} className="mt-2 max-w-sm" />
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}