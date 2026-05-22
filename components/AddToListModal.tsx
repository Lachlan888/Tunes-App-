"use client"

import { useActionState, useEffect, useMemo, useRef, useState } from "react"
import SubmitButton from "@/components/SubmitButton"
import ResponsiveModal from "@/components/ui/ResponsiveModal"
import { buttonStyles } from "@/components/ui/buttonStyles"
import { statusStyles } from "@/components/ui/statusStyles"
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

const inputClass =
  "w-full rounded-xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"

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
  const [selectedListIds, setSelectedListIds] = useState<number[]>([])
  const [showCreateForm, setShowCreateForm] = useState(
    !learningLists || learningLists.length === 0
  )
  const [localLearningLists, setLocalLearningLists] = useState<LearningList[]>(
    learningLists ?? []
  )
  const [createSuccessMessage, setCreateSuccessMessage] = useState("")
  const [createState, createListAction, isCreatePending] = useActionState(
    createListInline,
    initialCreateListInlineState
  )

  const hasAppliedCreatedListRef = useRef(false)

  useEffect(() => {
    setLocalLearningLists(learningLists ?? [])
  }, [learningLists])

  useEffect(() => {
    const initialSelectedId = Number(selectedListId)

    if (
      Number.isInteger(initialSelectedId) &&
      initialSelectedId > 0 &&
      !existingListIds.includes(initialSelectedId)
    ) {
      setSelectedListIds([initialSelectedId])
    } else {
      setSelectedListIds([])
    }
  }, [selectedListId, selectedPiece.id, existingListIds])

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
    setSelectedListIds((currentListIds) =>
      currentListIds.includes(createdList.id)
        ? currentListIds
        : [...currentListIds, createdList.id]
    )
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

  const isClosingDisabled = isAddPending || isCreatePending
  const hasLists = availableLists.length > 0
  const selectedAddableListIds = selectedListIds.filter(
    (listId) => !existingListIds.includes(listId)
  )

  function handleClose() {
    if (isClosingDisabled) return

    onClose()
  }

  function toggleListSelection(listId: number) {
    if (existingListIds.includes(listId) || isClosingDisabled) return

    setSelectedListIds((currentListIds) =>
      currentListIds.includes(listId)
        ? currentListIds.filter((currentListId) => currentListId !== listId)
        : [...currentListIds, listId]
    )

    onChangeSelectedListId(String(listId))
  }

  return (
    <ResponsiveModal
      isOpen
      onClose={handleClose}
      closeDisabled={isClosingDisabled}
      mobileMode="sheet"
      desktopMaxWidth="md:max-w-md"
      eyebrow="Lists"
      title="Add to List"
      description={selectedPiece.title}
      bodyClassName="min-h-0 flex-1 overflow-y-auto p-5 md:p-6"
    >
      <form
        action={async (formData: FormData) => {
          setIsAddPending(true)
          await addToLearningList(formData)
        }}
      >
        <input type="hidden" name="piece_id" value={selectedPiece.id} />
        <input type="hidden" name="redirect_to" value={redirectTo} />

        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-sm font-medium">Choose lists</p>

          {selectedAddableListIds.length > 0 ? (
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {selectedAddableListIds.length} selected
            </p>
          ) : null}
        </div>

        {!hasLists ? (
          <p className="rounded-xl border border-border bg-muted/60 p-3 text-sm text-muted-foreground">
            You do not have any lists yet.
          </p>
        ) : (
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1 md:max-h-80">
            {availableLists.map((learningList) => {
              const isAlreadyAdded = existingListIds.includes(learningList.id)
              const isSelected = selectedListIds.includes(learningList.id)

              return (
                <label
                  key={learningList.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 text-sm transition ${
                    isAlreadyAdded
                      ? "cursor-not-allowed border-border bg-muted/50 text-muted-foreground"
                      : isSelected
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-background/60 text-foreground hover:border-primary/70"
                  }`}
                >
                  <input
                    type="checkbox"
                    name="learning_list_ids"
                    value={learningList.id}
                    checked={isSelected || isAlreadyAdded}
                    disabled={isClosingDisabled || isAlreadyAdded}
                    onChange={() => toggleListSelection(learningList.id)}
                    className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-[var(--focus-ring)]"
                  />

                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{learningList.name}</span>

                    {learningList.description ? (
                      <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                        {learningList.description}
                      </span>
                    ) : null}

                    {isAlreadyAdded ? (
                      <span className="mt-1 block text-xs font-medium text-muted-foreground">
                        Already in this list
                      </span>
                    ) : null}
                  </span>
                </label>
              )
            })}
          </div>
        )}

        {createSuccessMessage ? (
          <p className={`mt-3 rounded-xl border p-3 text-sm ${statusStyles.success}`}>
            {createSuccessMessage}
          </p>
        ) : null}

        {hasLists && selectedAddableListIds.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Select one or more lists to add this tune.
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            className={buttonStyles.secondary}
            onClick={handleClose}
            disabled={isClosingDisabled}
          >
            Cancel
          </button>

          <SubmitButton
            label={
              selectedAddableListIds.length > 1
                ? `Add to ${selectedAddableListIds.length} lists`
                : "Add to selected lists"
            }
            pendingLabel="Adding..."
            className={buttonStyles.primary}
            disabled={selectedAddableListIds.length === 0 || isClosingDisabled}
          />
        </div>
      </form>

      <div className="mt-6 border-t border-border pt-5">
        {!showCreateForm ? (
          <button
            type="button"
            className={buttonStyles.text}
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
                className={inputClass}
                placeholder="e.g. Session tunes"
                disabled={isClosingDisabled}
              />
            </div>

            <input type="hidden" name="description" value="" />
            <input type="hidden" name="visibility" value="private" />

            {createState.status === "error" && createState.error ? (
              <p className={`rounded-xl border p-3 text-sm ${statusStyles.error}`}>
                {createState.error}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <SubmitButton
                label="Create list"
                pendingLabel="Creating..."
                className={buttonStyles.primary}
              />

              <button
                type="button"
                className={buttonStyles.secondary}
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
    </ResponsiveModal>
  )
}