import SubmitButton from "@/components/SubmitButton"
import { buttonStyles } from "@/components/ui/buttonStyles"
import { createPracticeFocus } from "@/lib/actions/practice-foci"

export default function PracticeFocusCreateForm() {
  return (
    <form
      action={createPracticeFocus}
      className="rounded-3xl border border-border bg-card p-6 shadow-sm"
    >
      <input type="hidden" name="redirect_to" value="/review/foci" />

      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        New focus
      </p>

      <h2 className="mt-2 font-serif text-2xl font-bold text-foreground">
        Create a practice focus
      </h2>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Use foci for broader arcs of work, like right-hand looseness, session
        tempo, Australian tunes in D, or festival set prep.
      </p>

      <div className="mt-5 grid gap-4">
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Title
          <input
            name="title"
            required
            className="rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-[var(--focus-ring)]"
            placeholder="Tempo security"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-foreground">
          Description
          <textarea
            name="description"
            rows={4}
            className="rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-[var(--focus-ring)]"
            placeholder="What are you trying to improve over time?"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-foreground">
          Optional target date
          <input
            name="target_date"
            type="date"
            className="rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-[var(--focus-ring)]"
          />
        </label>
      </div>

      <div className="mt-5">
        <SubmitButton
          label="Create focus"
          pendingLabel="Creating..."
          className={buttonStyles.primary}
        />
      </div>
    </form>
  )
}