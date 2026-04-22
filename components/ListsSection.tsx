import PracticeProgress from "@/components/PracticeProgress"
import SubmitButton from "@/components/SubmitButton"
import TuneCard from "@/components/TuneCard"
import type { Piece, UserPiece } from "@/lib/types"

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

type ListsSectionProps = {
  learningLists: LearningList[] | null
  userPieces: UserPiece[] | null
  practiceStageByPieceId: Map<number, number>
  startLearning: (formData: FormData) => Promise<void>
}

function getPiece(pieces: Piece | Piece[] | null): Piece | null {
  if (!pieces) return null
  return Array.isArray(pieces) ? pieces[0] ?? null : pieces
}

export default function ListsSection({
  learningLists,
  userPieces,
  practiceStageByPieceId,
  startLearning,
}: ListsSectionProps) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 text-2xl font-semibold">Lists</h2>

      {!learningLists || learningLists.length === 0 ? (
        <p className="text-gray-600">No lists found for this user yet.</p>
      ) : (
        <div className="space-y-6">
          {learningLists.map((list: LearningList) => {
            const sortedItems = [...(list.learning_list_items || [])].sort(
              (a, b) => {
                if (a.position == null && b.position == null) return 0
                if (a.position == null) return 1
                if (b.position == null) return -1
                return a.position - b.position
              }
            )

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

                      const isAlreadyInPractice = userPieces?.some(
                        (userPiece: UserPiece) => userPiece.piece_id === piece.id
                      )

                      const practiceStage =
                        practiceStageByPieceId.get(piece.id) ?? null

                      return (
                        <div key={item.id}>
                          <TuneCard
                            id={piece.id}
                            title={piece.title}
                            keyValue={piece.key}
                            style={piece.style}
                            timeSignature={piece.time_signature}
                            referenceUrl={piece.reference_url}
                            listNames={[]}
                          >
                            {practiceStage !== null && (
                              <PracticeProgress
                                stage={practiceStage}
                                className="min-w-[220px] flex-1"
                              />
                            )}

                            {isAlreadyInPractice ? (
                              <p className="text-sm text-gray-600">
                                Already in practice
                              </p>
                            ) : (
                              <form action={startLearning}>
                                <input type="hidden" name="piece_id" value={piece.id} />
                                <SubmitButton
                                  label="Start Practice"
                                  pendingLabel="Starting..."
                                  className="bg-black px-3 py-1 text-sm text-white"
                                />
                              </form>
                            )}
                          </TuneCard>
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