import SubmitButton from "@/components/SubmitButton"
import { saveDailyReflection } from "@/lib/actions/practice-diary"

type DailyReflectionFormProps = {
  practiceDate: string
  redirectTo: string
  initialValue: string
}

const textareaClassName =
  "w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"

export default function DailyReflectionForm({
  practiceDate,
  redirectTo,
  initialValue,
}: DailyReflectionFormProps) {
  return (
    <form action={saveDailyReflection} className="mt-4 space-y-3">
      <input type="hidden" name="practice_date" value={practiceDate} />
      <input type="hidden" name="redirect_to" value={redirectTo} />

      <textarea
        name="daily_reflection"
        rows={5}
        defaultValue={initialValue}
        placeholder="What happened in practice overall today?"
        className={textareaClassName}
      />

      <SubmitButton
        label="Save reflection"
        pendingLabel="Saving..."
        className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
      />
    </form>
  )
}