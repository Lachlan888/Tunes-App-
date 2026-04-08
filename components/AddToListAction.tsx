"use client"

import { useState } from "react"
import AddToListModal from "@/components/AddToListModal"
import type { LearningList, Piece } from "@/lib/types"

type LearningListItemRow = {
  learning_list_id: number
  piece_id: number
}

type AddToListActionProps = {
  piece: Piece
  learningLists: LearningList[] | null
  learningListItems: LearningListItemRow[] | null
  redirectTo: string
  addToLearningList: (formData: FormData) => Promise<void>
  buttonClassName?: string
  buttonLabel?: string
}

export default function AddToListAction({
  piece,
  learningLists,
  learningListItems,
  redirectTo,
  addToLearningList,
  buttonClassName = "w-full border px-3 py-2 text-sm",
  buttonLabel = "Add to List",
}: AddToListActionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedListId, setSelectedListId] = useState("")

  const existingListIds = Array.from(
    new Set((learningListItems ?? []).map((item) => item.learning_list_id))
  )

  return (
    <>
      <button
        type="button"
        className={buttonClassName}
        onClick={() => {
          setSelectedListId("")
          setIsOpen(true)
        }}
      >
        {buttonLabel}
      </button>

      {isOpen && (
        <AddToListModal
          selectedPiece={piece}
          selectedListId={selectedListId}
          learningLists={learningLists}
          existingListIds={existingListIds}
          redirectTo={redirectTo}
          addToLearningList={addToLearningList}
          onChangeSelectedListId={setSelectedListId}
          onClose={() => {
            setIsOpen(false)
            setSelectedListId("")
          }}
        />
      )}
    </>
  )
}