type Piece = {
  id: number
  title: string
  key: string | null
  style: string | null
  time_signature: string | null
}

type LearningListItem = {
  id: number
  position: number | null
  pieces: Piece | Piece[] | null
}

type LearningList = {
  id: number
  name: string
  description: string | null
  learning_list_items: LearningListItem[]
}

type UserPiece = {
  id: number
  piece_id: number
  status: string
  next_review_due: string | null
  stage: number
}

type LearningListsSectionProps = {
  learningLists: LearningList[] | null
  userPieces: UserPiece[] | null
  startLearning: (formData: FormData) => Promise<void>
}

function getPiece(pieces: Piece | Piece[] | null): Piece | null {
  if (!pieces) return null
  return Array.isArray(pieces) ? pieces[0] ?? null : pieces
}

export default function LearningListsSection({
  learningLists,
  userPieces,
  startLearning,
}: LearningListsSectionProps) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 text-2xl font-semibold">Lists</h2>

      {!learningLists || learningLists.length === 0 ? (
        <p className="text-gray-600">No lists found for this user yet.</p>
      ) : (
        <div className="space-y-6">
          {learningLists.map((list: LearningList) => {
            const sortedItems = [...(list.learning_list_items || [])].sort((a, b) => {
              if (a.position == null && b.position == null) return 0
              if (a.position == null) return 1
              if (b.position == null) return -1
              return a.position - b.position
            })

            return (
              <div key={list.id} className="rounded-lg border p-4">
                <h3 className="text-xl font-medium">{list.name}</h3>

                {list.description ? (
                  <p className="mb-3 mt-1 text-gray-600">{list.description}</p>
                ) : null}

                {sortedItems.length === 0 ? (
                  <p className="text-sm text-gray-500">No tunes in this list yet.</p>
                ) : (
                  <div className="space-y-3">
                    {sortedItems.map((item: LearningListItem) => {
                      const piece = getPiece(item.pieces)

                      if (!piece) return null

                      const alreadyStarted = userPieces?.some(
                        (userPiece: UserPiece) => userPiece.piece_id === piece.id
                      )

                      return (
                        <div key={item.id} className="rounded border p-3">
                          <div className="font-medium">{piece.title}</div>

                          <div className="text-sm text-gray-600">
                            {piece.key ? `Key: ${piece.key}` : "Key: Unknown"}
                            {" · "}
                            {piece.style ? `Style: ${piece.style}` : "Style: Unknown"}
                            {" · "}
                            {piece.time_signature
                              ? `Time: ${piece.time_signature}`
                              : "Time: Unknown"}
                          </div>

                          {alreadyStarted ? (
                            <p className="mt-2 text-sm text-gray-600">
                              Already in active learning
                            </p>
                          ) : (
                            <form action={startLearning} className="mt-2">
                              <input type="hidden" name="piece_id" value={piece.id} />
                              <button className="bg-black px-3 py-1 text-sm text-white">
                                Start Learning
                              </button>
                            </form>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}