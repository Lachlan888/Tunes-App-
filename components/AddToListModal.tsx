"use client"

type Piece = {
  id: number
  title: string
  key: string | null
  style: string | null
  time_signature: string | null
}

type LearningList = {
  id: number
  name: string
  description: string | null
}

type AddToListModalProps = {
  selectedPiece: Piece
  selectedListId: string
  learningLists: LearningList[] | null
  existingListIds: number[]
  redirectTo: string
  addToLearningList: (formData: FormData) => Promise<void>
  onChangeSelectedListId: (value: string) => void
  onClose: () => void
}

export default function AddToListModal({
  selectedPiece,
  selectedListId,
  learningLists,
  existingListIds,
  redirectTo,
  addToLearningList,
  onChangeSelectedListId,
  onClose,
}: AddToListModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        action={addToLearningList}
        className="w-full max-w-md rounded bg-white p-6 shadow-lg"
      >
        <h2 className="mb-2 text-xl font-semibold">Add to List</h2>
        <p className="mb-4 text-sm text-gray-600">{selectedPiece.title}</p>

        <input type="hidden" name="piece_id" value={selectedPiece.id} />
        <input type="hidden" name="redirect_to" value={redirectTo} />

        <label
          htmlFor="learning_list_id"
          className="mb-2 block text-sm font-medium"
        >
          Choose a list
        </label>

        <select
          id="learning_list_id"
          name="learning_list_id"
          value={selectedListId}
          onChange={(event) => onChangeSelectedListId(event.target.value)}
          className="mb-4 w-full border p-2"
        >
          <option value="">Select a list</option>
          {(learningLists ?? []).map((learningList) => {
            const isAlreadyAdded = existingListIds.includes(learningList.id)

            return (
              <option
                key={learningList.id}
                value={learningList.id}
                disabled={isAlreadyAdded}
              >
                {isAlreadyAdded
                  ? `${learningList.name} (already added)`
                  : learningList.name}
              </option>
            )
          })}
        </select>

        {(!learningLists || learningLists.length === 0) && (
          <p className="mb-4 text-sm text-gray-600">
            You do not have any lists yet.
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            className="border px-4 py-2 text-sm"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
            disabled={!selectedListId}
          >
            Add
          </button>
        </div>
      </form>
    </div>
  )
}