import SubmitButton from "@/components/SubmitButton"
import { createPracticeNote } from "@/lib/actions/practice-diary"
import type { PracticeNoteCategory } from "@/lib/loaders/practice-diary"

type PracticeNoteFormProps = {
  practiceDate: string
  redirectTo: string
  categories: PracticeNoteCategory[]
  practiceEventId?: number | null
  pieceId?: number | null
  reviewEventId?: number | null
  label?: string
  placeholder?: string
}

const inputClassName =
  "w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"

const selectClassName =
  "rounded-full border border-border bg-background/70 px-4 py-2 text-sm text-foreground shadow-sm outline-none transition focus:ring-2 focus:ring-[var(--focus-ring)]"

export default function PracticeNoteForm({
  practiceDate,
  redirectTo,
  categories,
  practiceEventId = null,
  pieceId = null,
  reviewEventId = null,
  label = "Add practice note",
  placeholder = "What do you want to remember for next time?",
}: PracticeNoteFormProps) {
  return (
    <form action={createPracticeNote} className="mt-4 space-y-3">
      <input type="hidden" name="practice_date" value={practiceDate} />
      <input type="hidden" name="redirect_to" value={redirectTo} />

      {practiceEventId ? (
        <input
          type="hidden"
          name="practice_event_id"
          value={practiceEventId}
        />
      ) : null}

      {pieceId ? <input type="hidden" name="piece_id" value={pieceId} /> : null}

      {reviewEventId ? (
        <input type="hidden" name="review_event_id" value={reviewEventId} />
      ) : null}

      <label className="block">
        <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </span>

        <textarea
          name="body"
          rows={3}
          placeholder={placeholder}
          className={inputClassName}
          required
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <select name="category_id" className={selectClassName} defaultValue="">
          <option value="">No category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <SubmitButton
          label="Save note"
          pendingLabel="Saving..."
          className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
        />
      </div>
    </form>
  )
}