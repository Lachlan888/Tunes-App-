"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import PendingLinkButton from "@/components/PendingLinkButton"
import PracticeProgress from "@/components/practice/PracticeProgress"
import ReferenceMediaLink from "@/components/ReferenceMediaLink"
import RemoveFromPracticeButton from "@/components/practice/RemoveFromPracticeButton"
import SubmitButton from "@/components/SubmitButton"
import ResponsiveModal from "@/components/ui/ResponsiveModal"
import { buttonStyles } from "@/components/ui/buttonStyles"
import { createPracticeNoteCategory } from "@/lib/actions/practice-diary"
import { markFailed, markShaky, markSolid } from "@/lib/actions/reviews"
import { APP_TIME_ZONE } from "@/lib/review"
import type { PracticeNoteCategory } from "@/lib/loaders/practice-diary"
import type {
  PracticeFocusForReview,
  RecentPracticeNoteForReview,
  ReviewQueueItem,
} from "@/lib/loaders/review"

type ReviewOutcome = "failed" | "shaky" | "solid"

type ReviewOutcomeConfig = {
  outcome: ReviewOutcome
  label: string
  modalTitle: string
  action: (formData: FormData) => Promise<void>
  className: string
}

type PracticeReviewCardProps = {
  userPiece: ReviewQueueItem
  redirectTo: string
  badgeLabel: string
  badgeClassName: string
  practiceDiaryEnabled: boolean
  noteCategories: PracticeNoteCategory[]
}

const REVIEW_OUTCOMES: ReviewOutcomeConfig[] = [
  {
    outcome: "failed",
    label: "Rough",
    modalTitle: "Rough review note",
    action: markFailed,
    className: buttonStyles.reviewRough,
  },
  {
    outcome: "shaky",
    label: "Shaky",
    modalTitle: "Shaky review note",
    action: markShaky,
    className: buttonStyles.reviewShaky,
  },
  {
    outcome: "solid",
    label: "Solid",
    modalTitle: "Solid review note",
    action: markSolid,
    className: buttonStyles.reviewSolid,
  },
]

function formatDueDate(dateValue: string | null) {
  if (!dateValue) return "No due date"

  return new Date(dateValue).toLocaleDateString("en-AU", {
    timeZone: APP_TIME_ZONE,
  })
}

function formatDateOnly(dateOnly: string | null) {
  if (!dateOnly) return "Undated"

  const [year, month, day] = dateOnly.split("-")

  if (!year || !month || !day) {
    return dateOnly
  }

  return `${day}/${month}/${year}`
}

function getReviewButtonClassName(className: string) {
  return `${className} !min-w-0 flex-1 !px-1.5 !py-2 text-[0.8rem] leading-none sm:!min-w-[104px] sm:flex-none sm:!px-4 sm:!py-2 sm:text-sm`
}

function ActivePracticeFoci({ foci }: { foci: PracticeFocusForReview[] }) {
  const [isOpen, setIsOpen] = useState(false)

  if (foci.length === 0) {
    return null
  }

  return (
    <section className="mt-5 border-t border-border pt-4">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 text-left md:hidden"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>
          <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Active foci
          </span>
          <span className="mt-1 block text-sm text-muted-foreground">
            {foci.length} focus {foci.length === 1 ? "cue" : "cues"} for this
            tune
          </span>
        </span>

        <span className="shrink-0 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
          {isOpen ? "Hide" : "Show"}
        </span>
      </button>

      <div className="hidden md:block">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Active foci
        </p>

        <ul className="mt-2 flex flex-wrap gap-2">
          {foci.map((focus) => (
            <li key={focus.id}>
              <Link
                href={`/review/foci/${focus.id}`}
                className="inline-flex rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:border-primary hover:bg-card hover:text-foreground"
                title={focus.description ?? undefined}
              >
                {focus.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {isOpen ? (
        <ul className="mt-4 divide-y divide-border md:hidden">
          {foci.map((focus) => (
            <li key={focus.id} className="py-3 first:pt-0 last:pb-0">
              <Link
                href={`/review/foci/${focus.id}`}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {focus.title}
              </Link>

              {focus.description ? (
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {focus.description}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

function RecentPracticeNotes({
  notes,
}: {
  notes: RecentPracticeNoteForReview[]
}) {
  const [isOpen, setIsOpen] = useState(false)

  if (notes.length === 0) {
    return null
  }

  return (
    <div className="mt-5 rounded-2xl border border-border bg-background/70 p-3 sm:p-4">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 text-left"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>
          <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Recent notes
          </span>
          <span className="mt-1 block text-sm text-muted-foreground">
            {notes.length} recent note{notes.length === 1 ? "" : "s"} for this
            tune
          </span>
        </span>

        <span className="shrink-0 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
          {isOpen ? "Hide" : "Show"}
        </span>
      </button>

      {isOpen ? (
        <ol className="mt-4 space-y-3">
          {notes.map((note) => (
            <li
              key={note.id}
              className="rounded-xl border border-border bg-muted/70 p-3"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <span>{formatDateOnly(note.practice_date)}</span>

                {note.category_name ? (
                  <>
                    <span aria-hidden="true">|</span>
                    <span>{note.category_name}</span>
                  </>
                ) : null}
              </div>

              <p className="mt-2 text-sm leading-6 text-foreground">
                {note.body}
              </p>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  )
}

function DirectReviewForms({
  userPieceId,
  redirectTo,
}: {
  userPieceId: number
  redirectTo: string
}) {
  return (
    <div className="mt-3 flex w-full gap-1 sm:w-auto sm:flex-wrap sm:gap-3">
      {REVIEW_OUTCOMES.map((reviewOutcome) => (
        <form
          key={reviewOutcome.outcome}
          action={reviewOutcome.action}
          className="min-w-0 flex-1 sm:flex-none"
        >
          <input type="hidden" name="userPieceId" value={userPieceId} />
          <input type="hidden" name="redirectTo" value={redirectTo} />

          <SubmitButton
            label={reviewOutcome.label}
            pendingLabel="Saving..."
            className={getReviewButtonClassName(reviewOutcome.className)}
          />
        </form>
      ))}
    </div>
  )
}

function DiaryReviewButtons({
  onSelectOutcome,
}: {
  onSelectOutcome: (outcome: ReviewOutcomeConfig) => void
}) {
  return (
    <div className="mt-3 flex w-full gap-1 sm:w-auto sm:flex-wrap sm:gap-3">
      {REVIEW_OUTCOMES.map((reviewOutcome) => (
        <button
          key={reviewOutcome.outcome}
          type="button"
          className={getReviewButtonClassName(reviewOutcome.className)}
          onClick={() => onSelectOutcome(reviewOutcome)}
        >
          {reviewOutcome.label}
        </button>
      ))}
    </div>
  )
}

function AddCategoryInReviewDisclosure({
  redirectTo,
}: {
  redirectTo: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <section className="rounded-2xl border border-border bg-background/70 p-4">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 text-left"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>
          <span className="block text-sm font-semibold text-foreground">
            Need a new category?
          </span>
          <span className="mt-1 block text-sm leading-6 text-muted-foreground">
            Add a practice lens without going back to the diary page.
          </span>
        </span>

        <span className="shrink-0 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
          {isOpen ? "Hide" : "Add"}
        </span>
      </button>

      {isOpen ? (
        <form action={createPracticeNoteCategory} className="mt-4 space-y-3">
          <input type="hidden" name="redirect_to" value={redirectTo} />

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Category name
            </span>

            <input
              name="name"
              placeholder="Tone"
              required
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Prompt, optional
            </span>

            <textarea
              name="prompt"
              rows={3}
              placeholder="What changed about the sound today?"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm leading-6 text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
          </label>

          <div>
            <SubmitButton
              label="Create category"
              pendingLabel="Creating..."
              className={buttonStyles.secondary}
            />
          </div>

          <p className="text-xs leading-5 text-muted-foreground">
            Creating a category refreshes the review page. Reopen this tune’s
            review note and the new category will be available.
          </p>
        </form>
      ) : null}
    </section>
  )
}

function ReviewNoteModal({
  selectedOutcome,
  userPiece,
  redirectTo,
  title,
  noteCategories,
  onClose,
}: {
  selectedOutcome: ReviewOutcomeConfig
  userPiece: ReviewQueueItem
  redirectTo: string
  title: string
  noteCategories: PracticeNoteCategory[]
  onClose: () => void
}) {
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

export default function PracticeReviewCard({
  userPiece,
  redirectTo,
  badgeLabel,
  badgeClassName,
  practiceDiaryEnabled,
  noteCategories,
}: PracticeReviewCardProps) {
  const [selectedOutcome, setSelectedOutcome] =
    useState<ReviewOutcomeConfig | null>(null)

  const title = userPiece.piece?.title ?? "Untitled piece"

  return (
    <article className="relative min-w-0 overflow-hidden rounded-2xl border border-border bg-background/70 p-3 shadow-sm transition hover:bg-muted/70 sm:p-5">
      <div className="absolute right-3 top-3 z-10 sm:right-4 sm:top-4">
        <RemoveFromPracticeButton
          userPieceId={userPiece.id}
          redirectTo={redirectTo}
          confirmMessage={`Remove "${title}" from active practice? This stops review scheduling for this tune, but does not delete the shared tune or remove it from your lists.`}
          label="×"
          pendingLabel="…"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/80 text-lg font-semibold leading-none text-muted-foreground shadow-sm transition hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
        />
      </div>

      <div className="flex min-w-0 flex-col gap-3 pr-10 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:pr-12">
        <div className="min-w-0 flex-1">
          <h2 className="break-words pr-1 font-serif text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
            {userPiece.piece ? (
              <PendingLinkButton
                href={`/library/${userPiece.piece.id}`}
                label={title}
                pendingLabel="Loading..."
                className="decoration-primary decoration-2 underline-offset-4 hover:underline"
              />
            ) : (
              title
            )}
          </h2>

          <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">
            Key: {userPiece.piece?.key ?? "Unknown"}{" "}
            <span aria-hidden="true">|</span> Style:{" "}
            {userPiece.piece?.style ?? "Unknown"}{" "}
            <span aria-hidden="true">|</span> Time:{" "}
            {userPiece.piece?.time_signature ?? "Unknown"}
          </p>

          <p className="mt-1 text-sm font-medium leading-6 text-muted-foreground">
            Due: {formatDueDate(userPiece.next_review_due)}
          </p>
        </div>

        <span
          className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${badgeClassName}`}
        >
          {badgeLabel}
        </span>
      </div>

      {userPiece.piece?.reference_url && userPiece.piece?.title && (
        <div className="mt-4 w-full">
          <ReferenceMediaLink
            referenceUrl={userPiece.piece.reference_url}
            title={userPiece.piece.title}
            className="text-sm font-medium text-muted-foreground underline underline-offset-4 transition hover:text-foreground"
          />
        </div>
      )}

      <PracticeProgress stage={userPiece.stage} className="mt-5" />

      <ActivePracticeFoci foci={userPiece.active_practice_foci} />

      <RecentPracticeNotes notes={userPiece.recent_practice_notes} />

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          How did it go?
        </p>

        {practiceDiaryEnabled ? (
          <DiaryReviewButtons onSelectOutcome={setSelectedOutcome} />
        ) : (
          <DirectReviewForms
            userPieceId={userPiece.id}
            redirectTo={redirectTo}
          />
        )}
      </div>

      {selectedOutcome ? (
        <ReviewNoteModal
          selectedOutcome={selectedOutcome}
          userPiece={userPiece}
          redirectTo={redirectTo}
          title={title}
          noteCategories={noteCategories}
          onClose={() => setSelectedOutcome(null)}
        />
      ) : null}
    </article>
  )
}