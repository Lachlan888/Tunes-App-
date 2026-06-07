"use client"

import { useMemo, useState } from "react"
import AddCategoryInReviewDisclosure from "@/components/practice/AddCategoryInReviewDisclosure"
import { buildReviewSubmissionKey } from "@/components/practice/ReviewOutcomeButtons"
import SubmitButton from "@/components/SubmitButton"
import ResponsiveModal from "@/components/ui/ResponsiveModal"
import { buttonStyles } from "@/components/ui/buttonStyles"
import type { PracticeNoteCategory } from "@/lib/loaders/practice-diary"
import type { ReviewQueueItem } from "@/lib/loaders/review"
import type { ReviewOutcomeConfig } from "@/components/practice/reviewOutcomeConfig"

type ReviewNoteModalProps = {
  selectedOutcome: ReviewOutcomeConfig
  userPiece: ReviewQueueItem
  redirectTo: string
  title: string
  noteCategories: PracticeNoteCategory[]
  onClose: () => void
}

export default function ReviewNoteModal({
  selectedOutcome,
  userPiece,
  redirectTo,
  title,
  noteCategories,
  onClose,
}: ReviewNoteModalProps) {
  const [selectedFocusId, setSelectedFocusId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const linkedFocusIds = useMemo(
    () => new Set(userPiece.active_practice_foci.map((focus) => focus.id)),
    [userPiece.active_practice_foci]
  )

  const selectedFocusNumber = Number(selectedFocusId)

  const selectedFocusIsAlreadyLinked =
    Number.isInteger(selectedFocusNumber) &&
    linkedFocusIds.has(selectedFocusNumber)

  const shouldShowAddTuneToFocus =
    selectedFocusId !== "" && !selectedFocusIsAlreadyLinked

  function closeModal() {
    if (isSubmitting) return
    onClose()
  }

  return (
    <ResponsiveModal
      isOpen
      onClose={closeModal}
      closeDisabled={isSubmitting}
      closeOnOverlayClick={!isSubmitting}
      closeOnEscape={!isSubmitting}
      mobileMode="sheet"
      desktopMaxWidth="md:max-w-lg"
      eyebrow="Practice diary"
      title={selectedOutcome.modalTitle}
      description={`Add an optional note for ${title}. Saving will also record the ${selectedOutcome.label.toLowerCase()} review result.`}
    >
      <div className="space-y-4">
        <AddCategoryInReviewDisclosure redirectTo={redirectTo} />

        <form
          action={async (formData: FormData) => {
            setIsSubmitting(true)
            await selectedOutcome.action(formData)
          }}
          className="space-y-4"
        >
          <input type="hidden" name="userPieceId" value={userPiece.id} />
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <input
            type="hidden"
            name="reviewSubmissionKey"
            value={buildReviewSubmissionKey({
              userPieceId: userPiece.id,
              stage: userPiece.stage,
              nextReviewDue: userPiece.next_review_due,
              outcome: selectedOutcome.outcome,
            })}
          />

          <label className="block">
            <span className="text-sm font-semibold text-foreground">
              Category
            </span>

            <select
              name="category_id"
              defaultValue=""
              className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              disabled={isSubmitting}
            >
              <option value="">No category</option>
              {noteCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          {userPiece.practice_focus_options.length > 0 ? (
            <label className="block">
              <span className="text-sm font-semibold text-foreground">
                Focus
              </span>

              <select
                name="focus_id"
                value={selectedFocusId}
                onChange={(event) => setSelectedFocusId(event.target.value)}
                className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                disabled={isSubmitting}
              >
                <option value="">No focus</option>
                {userPiece.practice_focus_options.map((focus) => (
                  <option key={focus.id} value={focus.id}>
                    {focus.title}
                    {linkedFocusIds.has(focus.id) ? " (already linked)" : ""}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {shouldShowAddTuneToFocus ? (
            <label className="flex gap-3 rounded-2xl border border-border bg-background/70 p-3 text-sm leading-6 text-muted-foreground">
              <input
                type="checkbox"
                name="add_tune_to_focus"
                defaultChecked
                className="mt-1"
                disabled={isSubmitting}
              />
              <span>Also add this tune to the selected focus from now on.</span>
            </label>
          ) : null}

          <label className="block">
            <span className="text-sm font-semibold text-foreground">
              Optional note
            </span>

            <textarea
              name="practice_note"
              rows={5}
              placeholder="What happened with this tune today?"
              className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm leading-6 text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              disabled={isSubmitting}
            />
          </label>

          <div className="grid grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:items-center">
            <SubmitButton
              label={`Save ${selectedOutcome.label}`}
              pendingLabel="Saving..."
              className={`${selectedOutcome.className} w-full sm:w-auto`}
            />

            <button
              type="button"
              className={`${buttonStyles.secondary} w-full sm:w-auto`}
              onClick={closeModal}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </ResponsiveModal>
  )
}
