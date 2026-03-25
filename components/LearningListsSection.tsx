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

export default function LearningListsSection({
  learningLists,
  userPieces,
  startLearning,
}: LearningListsSectionProps) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 text-2xl font-semibold">Learning Lists</h2>

      {!learningLists || learningLists.length === 0 ? (
        <p className="text-gray-600">
          No learning lists found for this user yet.
        </p>
      ) : (
        learningLists.map((list: LearningList) => {
          const sortedItems = [...(list.learning_list_items || [])].sort((a, b) => {
            if (a.position == null && b.position == null) return 0
            if (a.position == null) return 1
            if (b.position == null) return -1
            return a.position - b.position
          })

          return (
            <div key={list.id} className="mb-6">
              <h3 className="text-xl font-medium">{list.name}</h3>
              {list.description && (
                <p className="mb-2 text-gray-600">{list.description}</p>
              )}

              <ul className="list-disc pl-6">
                {sortedItems.map((item: LearningListItem) => {
                  const piece = Array.isArray(item.pieces)
                    ? item.pieces[0]
                    : item.pieces

                  if (!piece) return null

                  const alreadyStarted = userPieces?.some(
                    (userPiece: UserPiece) => userPiece.piece_id === piece.id
                  )

                  return (
                    <li key={item.id} className="mb-2">
                      <div>
                        {piece.title}
                        {piece.key ? `, key ${piece.key}` : ""}
                        {piece.style ? `, ${piece.style}` : ""}
                        {piece.time_signature ? `, ${piece.time_signature}` : ""}
                      </div>

                      {alreadyStarted ? (
                        <p className="text-sm text-gray-600">Already in active learning</p>
                      ) : (
                        <form action={startLearning} className="mt-1">
                          <input type="hidden" name="piece_id" value={piece.id} />
                          <button className="bg-black px-3 py-1 text-sm text-white">
                            Start Learning
                          </button>
                        </form>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })
      )}
    </section>
  )
}