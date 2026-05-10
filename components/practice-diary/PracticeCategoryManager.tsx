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
    <section className="rounded-3xl border border-border bg-background/60 p-5 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Your categories
      </h3>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Create the musical lenses you want to use when writing practice notes.
      </p>

      <section className="mt-5">
        <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Current categories
        </h4>

        {categories.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-border bg-background/70 p-4">
            <p className="text-sm leading-6 text-muted-foreground">
              You do not have any active practice categories yet.
            </p>

            <form action={ensureStarterPracticeCategories} className="mt-4">
              <SubmitButton
                label="Create starter categories"
                pendingLabel="Creating..."
                className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
              />
            </form>
          </div>
        ) : (
          <ul className="mt-3 space-y-3">
            {categories.map((category) => (
              <li
                key={category.id}
                className="rounded-2xl border border-border bg-background/70 p-4"
              >
                <div className="flex flex-col gap-3">
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
                    <input
                      type="hidden"
                      name="category_id"
                      value={category.id}
                    />
                    <input
                      type="hidden"
                      name="redirect_to"
                      value={redirectTo}
                    />

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
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Add a new category
        </h4>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Add another lens if you want to track a recurring musical concern,
          such as tone, memory, bowing, groove, backup, or source version.
        </p>

        <form action={createPracticeNoteCategory} className="mt-4 space-y-4">
          <input type="hidden" name="redirect_to" value={redirectTo} />

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Category name
            </span>
            <input
              name="name"
              placeholder="Tone"
              className={inputClassName}
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Prompt
            </span>
            <textarea
              name="prompt"
              rows={3}
              placeholder="What changed about the sound today?"
              className={inputClassName}
            />
          </label>

          <SubmitButton
            label="Add category"
            pendingLabel="Adding..."
            className="rounded-full border border-primary bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
          />
        </form>
      </section>
    </section>
  )
}