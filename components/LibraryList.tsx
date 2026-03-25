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
  stage: number
}

type LibraryListProps = {
  pieces: Piece[] | null
  userPieces: UserPiece[] | null
  startLearning: (formData: FormData) => Promise<void>
}

export default function LibraryList({
  pieces,
  userPieces,
  startLearning,
}: LibraryListProps) {
  if (!pieces || pieces.length === 0) {
    return <p className="text-gray-600">No tunes match this filter.</p>
  }

  return (
    <ul className="space-y-3">
      {pieces.map((piece: Piece) => {
        const alreadyStarted = (userPieces ?? []).some(
          (userPiece) => userPiece.piece_id === piece.id
        )

        return (
          <li key={piece.id} className="rounded border p-3">
            <div>
              {piece.title}
              {piece.key ? `, key ${piece.key}` : ""}
              {piece.style ? `, ${piece.style}` : ""}
              {piece.time_signature ? `, ${piece.time_signature}` : ""}
            </div>

            <div className="mt-2">
              {alreadyStarted ? (
                <p className="text-sm text-gray-600">Already in active learning</p>
              ) : (
                <form action={startLearning}>
                  <input type="hidden" name="piece_id" value={piece.id} />
                  <input type="hidden" name="redirect_to" value="/library" />
                  <button className="bg-black px-3 py-1 text-sm text-white">
                    Start Learning
                  </button>
                </form>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}