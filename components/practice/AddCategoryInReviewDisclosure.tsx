"use client"

import { useState } from "react"
import SubmitButton from "@/components/SubmitButton"
import { buttonStyles } from "@/components/ui/buttonStyles"
import { createPracticeNoteCategory } from "@/lib/actions/practice-diary"

type AddCategoryInReviewDisclosureProps = {
  redirectTo: string
}

export default function AddCategoryInReviewDisclosure({
  redirectTo,
}: AddCategoryInReviewDisclosureProps) {
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