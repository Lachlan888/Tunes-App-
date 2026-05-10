import SubmitButton from "@/components/SubmitButton"
import {
  archivePracticeNoteCategory,
  createPracticeNoteCategory,
  ensureStarterPracticeCategories,
} from "@/lib/actions/practice-diary"
import type { PracticeNoteCategory } from "@/lib/loaders/practice-diary"

type PracticeCategoryManagerProps = {
  categories: PracticeNoteCategory[]
  redirectTo: string
}

const inputClassName =
  "w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"

export default function PracticeCategoryManager({
  categories,
  redirectTo,
}: PracticeCategoryManagerProps) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Note categories
      </h2>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Categories help you tag practice notes by musical concern, such as
        Memory, Tempo, Feel, or Next step.
      </p>

      {categories.length === 0 ? (
        <form action={ensureStarterPracticeCategories} className="mt-4">
          <SubmitButton
            label="Create starter categories"
            pendingLabel="Creating..."
            className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
          />
        </form>
      ) : (
        <ul className="mt-5 space-y-3">
          {categories.map((category) => (
            <li
              key={category.id}
              className="rounded-2xl border border-border bg-background/70 p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {category.name}
                  </p>

                  {category.prompt ? (
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {category.prompt}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      No prompt yet.
                    </p>
                  )}
                </div>

                <form action={archivePracticeNoteCategory}>
                  <input type="hidden" name="category_id" value={category.id} />
                  <input type="hidden" name="redirect_to" value={redirectTo} />

                  <SubmitButton
                    label="Archive"
                    pendingLabel="Archiving..."
                    className="rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form action={createPracticeNoteCategory} className="mt-6 space-y-3">
        <input type="hidden" name="redirect_to" value={redirectTo} />

        <div className="grid gap-3 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto] md:items-end">
          <label>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Name
            </span>
            <input
              name="name"
              placeholder="Tone"
              className={inputClassName}
              required
            />
          </label>

          <label>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Prompt
            </span>
            <input
              name="prompt"
              placeholder="What changed about your sound today?"
              className={inputClassName}
            />
          </label>

          <SubmitButton
            label="Add category"
            pendingLabel="Adding..."
            className="rounded-full border border-primary bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
          />
        </div>
      </form>
    </section>
  )
}