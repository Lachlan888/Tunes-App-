import EditListModal from "@/components/lists/EditListModal"
import RemoveTuneButton from "@/components/RemoveTuneButton"
import SubmitButton from "@/components/SubmitButton"
import TuneCard from "@/components/TuneCard"
import {
  deleteList,
  removeTuneFromList,
  updateList,
} from "@/lib/actions/lists"
import { markAsKnown } from "@/lib/actions/known-pieces"
import { startLearning } from "@/lib/actions/user-pieces"
import { loadLearningListDetailData } from "@/lib/loaders/list-detail"
import type { Piece } from "@/lib/types"

type LearningListDetailPageProps = {
  params: Promise<{ id: string }>
  searchParams?: Promise<{
    remove_tune?: string
    edit_list?: string
  }>
}

function extractPiece(piece: Piece | Piece[] | null): Piece | null {
  if (!piece) return null
  return Array.isArray(piece) ? piece[0] ?? null : piece
}

export default async function LearningListDetailPage({
  params,
  searchParams,
}: LearningListDetailPageProps) {
  const { id } = await params

  const resolvedSearchParams = await searchParams
  const removeTuneStatus = resolvedSearchParams?.remove_tune ?? ""
  const editListStatus = resolvedSearchParams?.edit_list ?? ""

  const {
    typedList,
    typedItems,
    tunes,
    activePieceIds,
    knownPieceIds,
    redirectTo,
  } = await loadLearningListDetailData(id)

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-2 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{typedList.name}</h1>

        <EditListModal
          listId={typedList.id}
          name={typedList.name}
          description={typedList.description}
          visibility={typedList.visibility}
          redirectTo={redirectTo}
          tunes={tunes}
          updateList={updateList}
          removeTuneFromList={removeTuneFromList}
          deleteList={deleteList}
          triggerLabel="Manage List"
        />
      </div>

      <div className="mb-4 flex gap-3 text-sm text-gray-600">
        <span>{typedList.visibility === "public" ? "Public" : "Private"}</span>
        {typedList.is_imported && <span>Imported</span>}
      </div>

      {typedList.description && (
        <p className="mb-6 text-sm">{typedList.description}</p>
      )}

      {removeTuneStatus === "success" && (
        <div className="mb-6 rounded border border-green-600 bg-green-50 p-3 text-sm text-green-800">
          Tune removed from your app.
        </div>
      )}

      {removeTuneStatus === "missing_piece" && (
        <div className="mb-6 rounded border border-yellow-600 bg-yellow-50 p-3 text-sm text-yellow-800">
          Could not tell which tune to remove.
        </div>
      )}

      {removeTuneStatus === "error" && (
        <div className="mb-6 rounded border border-red-600 bg-red-50 p-3 text-sm text-red-800">
          Could not remove tune.
        </div>
      )}

      {editListStatus === "success" && (
        <div className="mb-6 rounded border border-green-600 bg-green-50 p-3 text-sm text-green-800">
          List updated.
        </div>
      )}

      {editListStatus === "removed_tune" && (
        <div className="mb-6 rounded border border-green-600 bg-green-50 p-3 text-sm text-green-800">
          Tune removed from this list.
        </div>
      )}

      {editListStatus === "deleted" && (
        <div className="mb-6 rounded border border-green-600 bg-green-50 p-3 text-sm text-green-800">
          List deleted.
        </div>
      )}

      {editListStatus === "missing_list" && (
        <div className="mb-6 rounded border border-yellow-600 bg-yellow-50 p-3 text-sm text-yellow-800">
          Could not tell which list to edit.
        </div>
      )}

      {editListStatus === "missing_name" && (
        <div className="mb-6 rounded border border-yellow-600 bg-yellow-50 p-3 text-sm text-yellow-800">
          Please enter a list name.
        </div>
      )}

      {editListStatus === "missing_item" && (
        <div className="mb-6 rounded border border-yellow-600 bg-yellow-50 p-3 text-sm text-yellow-800">
          Could not tell which tune to remove from the list.
        </div>
      )}

      {editListStatus === "invalid_visibility" && (
        <div className="mb-6 rounded border border-yellow-600 bg-yellow-50 p-3 text-sm text-yellow-800">
          Invalid list visibility.
        </div>
      )}

      {editListStatus === "not_found" && (
        <div className="mb-6 rounded border border-red-600 bg-red-50 p-3 text-sm text-red-800">
          List not found or you do not own it.
        </div>
      )}

      {editListStatus === "error" && (
        <div className="mb-6 rounded border border-red-600 bg-red-50 p-3 text-sm text-red-800">
          Could not update list.
        </div>
      )}

      <h2 className="mb-3 text-lg font-semibold">Tunes</h2>

      {typedItems.length === 0 ? (
        <p>This list has no tunes yet.</p>
      ) : (
        <div className="space-y-3">
          {typedItems.map((item) => {
            const piece = extractPiece(item.pieces)

            if (!piece) return null

            const isAlreadyInPractice = activePieceIds.has(piece.id)
            const isKnown = knownPieceIds.has(piece.id)

            return (
              <div key={item.id}>
                <TuneCard
                  id={piece.id}
                  title={piece.title}
                  keyValue={piece.key}
                  style={piece.style}
                  timeSignature={piece.time_signature}
                  referenceUrl={piece.reference_url}
                  pieceStyles={piece.piece_styles}
                  listNames={[]}
                >
                  {isAlreadyInPractice ? (
                    <p className="text-sm text-gray-600">Already in practice</p>
                  ) : (
                    <form action={startLearning}>
                      <input type="hidden" name="piece_id" value={piece.id} />
                      <input
                        type="hidden"
                        name="redirect_to"
                        value={redirectTo}
                      />
                      <SubmitButton
                        label="Start Practice"
                        pendingLabel="Starting..."
                        className="bg-black px-3 py-1 text-sm text-white"
                      />
                    </form>
                  )}

                  {isKnown ? (
                    <p className="text-sm text-gray-600">Known</p>
                  ) : (
                    <form action={markAsKnown}>
                      <input type="hidden" name="piece_id" value={piece.id} />
                      <input
                        type="hidden"
                        name="redirect_to"
                        value={redirectTo}
                      />
                      <SubmitButton
                        label={
                          isAlreadyInPractice ? "Set as known" : "Mark as known"
                        }
                        pendingLabel="Saving..."
                        className="border px-3 py-1 text-sm"
                      />
                    </form>
                  )}

                  <RemoveTuneButton
                    pieceId={piece.id}
                    redirectTo={redirectTo}
                  />
                </TuneCard>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}