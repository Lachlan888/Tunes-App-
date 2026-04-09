"use client"

import { useActionState, useEffect, useMemo, useRef, useState } from "react"
import SubmitButton from "@/components/SubmitButton"
import { createListInline } from "@/lib/actions/lists"

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

type CreateListInlineState = {
  status: "idle" | "success" | "error"
  error: string | null
  createdList: {
    id: number
    name: string
    description: string | null
    visibility: "private" | "public"
  } | null
}

const initialCreateListInlineState: CreateListInlineState = {
  status: "idle",
  error: null,
  createdList: null,
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
  const [isAddPending, setIsAddPending] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(
    !learningLists || learningLists.length === 0
  )
  const [localLearningLists, setLocalLearningLists] = useState<LearningList[]>(
    learningLists ?? []
  )
  const [createSuccessMessage, setCreateSuccessMessage] = useState("")
  const [createState, createListAction] = useActionState(
    createListInline,
    initialCreateListInlineState
  )

  const hasAppliedCreatedListRef = useRef(false)

  useEffect(() => {
    setLocalLearningLists(learningLists ?? [])
  }, [learningLists])

  useEffect(() => {
    if (
      createState.status !== "success" ||
      !createState.createdList ||
      hasAppliedCreatedListRef.current
    ) {
      return
    }

    const createdList = createState.createdList

    setLocalLearningLists((currentLists) => {
      const alreadyExists = currentLists.some((list) => list.id === createdList.id)

      if (alreadyExists) {
        return currentLists
      }

      return [
        ...currentLists,
        {
          id: createdList.id,
          name: createdList.name,
          description: createdList.description,
        },
      ]
    })

    onChangeSelectedListId(String(createdList.id))
    setShowCreateForm(false)
    setCreateSuccessMessage("List created and selected.")
    hasAppliedCreatedListRef.current = true
  }, [createState, onChangeSelectedListId])

  useEffect(() => {
    if (createState.status !== "success") {
      hasAppliedCreatedListRef.current = false
    }
  }, [createState.status])

  const availableLists = useMemo(() => localLearningLists, [localLearningLists])

  const isClosingDisabled = isAddPending
  const hasLists = availableLists.length > 0
  const selectedListIdNumber =
    selectedListId.trim() === "" ? null : Number(selectedListId)
  const isSelectedListAlreadyAdded =
    selectedListIdNumber != null && existingListIds.includes(selectedListIdNumber)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={() => {
        if (!isClosingDisabled) {
          onClose()
        }
      }}
    >
      <div
        className="w-full max-w-md rounded bg-white p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="mb-2 text-xl font-semibold">Add to List</h2>
        <p className="mb-4 text-sm text-gray-600">{selectedPiece.title}</p>

        <form
          action={async (formData: FormData) => {
            setIsAddPending(true)
            await addToLearningList(formData)
          }}
        >
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
            disabled={isClosingDisabled || !hasLists}
          >
            <option value="">Select a list</option>
            {availableLists.map((learningList) => {
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

          {!hasLists && (
            <p className="mb-4 text-sm text-gray-600">
              You do not have any lists yet.
            </p>
          )}

          {createSuccessMessage && (
            <p className="mb-4 text-sm text-green-700">{createSuccessMessage}</p>
          )}

          {isSelectedListAlreadyAdded && (
            <p className="mb-4 text-sm text-gray-600">
              This tune is already in the selected list.
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              className="border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              onClick={onClose}
              disabled={isClosingDisabled}
            >
              Cancel
            </button>

            <SubmitButton
              label="Add"
              pendingLabel="Adding..."
              className="bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
            />
          </div>
        </form>

        <div className="mt-6 border-t pt-4">
          {!showCreateForm ? (
            <button
              type="button"
              className="text-sm underline underline-offset-2"
              onClick={() => {
                setShowCreateForm(true)
                setCreateSuccessMessage("")
              }}
              disabled={isClosingDisabled}
            >
              Create new list
            </button>
          ) : (
            <form action={createListAction} className="space-y-3">
              <div>
                <label
                  htmlFor="new_list_name"
                  className="mb-2 block text-sm font-medium"
                >
                  New list name
                </label>
                <input
                  id="new_list_name"
                  name="name"
                  type="text"
                  className="w-full border p-2 text-sm"
                  placeholder="e.g. Session tunes"
                  disabled={isClosingDisabled}
                />
              </div>

              <input type="hidden" name="description" value="" />
              <input type="hidden" name="visibility" value="private" />

              {createState.status === "error" && createState.error && (
                <p className="text-sm text-red-700">{createState.error}</p>
              )}

              <div className="flex gap-2">
                <SubmitButton
                  label="Create list"
                  pendingLabel="Creating..."
                  className="border px-4 py-2 text-sm"
                />

                <button
                  type="button"
                  className="border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => {
                    setShowCreateForm(false)
                  }}
                  disabled={isClosingDisabled}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}