import SubmitButton from "@/components/SubmitButton"

type CreateListFormProps = {
  createList: (formData: FormData) => void | Promise<void>
  redirectTo?: string
  onSubmitStart?: () => void
}

const inputClass =
  "w-full rounded-xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"

export default function CreateListForm({
  createList,
  redirectTo = "/learning-lists",
  onSubmitStart,
}: CreateListFormProps) {
  return (
    <form
      action={async (formData: FormData) => {
        onSubmitStart?.()
        await createList(formData)
      }}
      className="space-y-4"
    >
      <input type="hidden" name="redirect_to" value={redirectTo} />

      <div>
        <label htmlFor="list_name" className="mb-2 block text-sm font-medium">
          Name
        </label>
        <input
          id="list_name"
          name="name"
          placeholder="e.g. Session tunes"
          className={inputClass}
          required
        />
      </div>

      <div>
        <label
          htmlFor="list_description"
          className="mb-2 block text-sm font-medium"
        >
          Description
        </label>
        <input
          id="list_description"
          name="description"
          placeholder="Optional description"
          className={inputClass}
        />
      </div>

      <SubmitButton
        label="Create"
        pendingLabel="Creating..."
        className="rounded-full border border-primary bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"
      />
    </form>
  )
}