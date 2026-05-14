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
    <section className="space-y-5">
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground md:text-sm">
          Current categories
        </h3>

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
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="break-words text-sm font-semibold text-foreground">
                      {category.name}
                    </p>

                    {category.prompt ? (
                      <p className="mt-1 break-words text-sm leading-6 text-muted-foreground">
                        {category.prompt}
                      </p>
                    ) : (
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        No prompt yet.
                      </p>
                    )}
                  </div>

                  <form action={archivePracticeNoteCategory} className="shrink-0">
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

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground md:text-sm">
          Add category
        </h3>

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