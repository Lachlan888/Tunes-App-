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
  "w-full rounded-control border border-hairline bg-surface-paper px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"

export default function PracticeCategoryManager({
  categories,
  redirectTo,
}: PracticeCategoryManagerProps) {
  return (
    <section className="space-y-5">
      <section>
        <h3 className="font-sans text-lg font-bold tracking-tight text-foreground">
          Current categories
        </h3>

        {categories.length === 0 ? (
          <div className="mt-3 border-y border-hairline bg-surface-note px-3 py-4">
            <p className="text-sm leading-6 text-muted-foreground">
              You do not have any active practice categories yet.
            </p>

            <form action={ensureStarterPracticeCategories} className="mt-4">
              <SubmitButton
                label="Create starter categories"
                pendingLabel="Creating..."
                className="inline-flex min-h-11 rounded-control border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70 items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
              />
            </form>
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-hairline border-y border-hairline">
            {categories.map((category) => (
              <li
                key={category.id}
                className="py-4"
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
                      className="inline-flex min-h-11 items-center justify-center rounded-control border border-hairline bg-surface-paper px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-surface-note hover:text-foreground disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                    />
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="border-t border-hairline pt-5">
        <h3 className="font-sans text-lg font-bold tracking-tight text-foreground">
          Add category
        </h3>

        <form action={createPracticeNoteCategory} className="mt-4 space-y-4">
          <input type="hidden" name="redirect_to" value={redirectTo} />

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-foreground">
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
            <span className="mb-2 block text-sm font-semibold text-foreground">
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
            className="inline-flex min-h-11 rounded-control border border-primary bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70 items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
          />
        </form>
      </section>
    </section>
  )
}
