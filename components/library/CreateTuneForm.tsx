"use client"

import SubmitButton from "@/components/SubmitButton"
import { KEY_OPTIONS } from "@/lib/music/keys"

type StyleOption = {
  id: number
  slug: string
  label: string
}

type CreateTuneFormProps = {
  createTune: (formData: FormData) => void | Promise<void>
  styleOptions: StyleOption[]
  redirectTo?: string
  onSubmitStart?: () => void
}

const inputClass =
  "w-full rounded-xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"

const helperClass = "mt-2 text-sm leading-6 text-muted-foreground"

export default function CreateTuneForm({
  createTune,
  styleOptions,
  redirectTo = "/library",
  onSubmitStart,
}: CreateTuneFormProps) {
  return (
    <form
      action={async (formData: FormData) => {
        onSubmitStart?.()
        await createTune(formData)
      }}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <input type="hidden" name="redirect_to" value={redirectTo} />

        <div className="mx-auto w-full max-w-2xl space-y-4">
          <p className="text-sm leading-6 text-muted-foreground">
            Create the tune first. You can add recordings, sheet music, notes,
            lists and Practice details on the tune page.
          </p>

          <div>
            <label htmlFor="title" className="mb-2 block text-sm font-medium">
              Tune title <span className="text-destructive">*</span>
            </label>
            <input
              id="title"
              name="title"
              placeholder="e.g. Soldier's Joy"
              className={inputClass}
              required
            />
            <p className={helperClass}>
              Use the common tune title. Leave out keys, instruments, and
              version labels.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="key" className="mb-2 block text-sm font-medium">
                Key
              </label>
              <select
                id="key"
                name="key"
                defaultValue=""
                className={inputClass}
              >
                {KEY_OPTIONS.map((key) => (
                  <option key={key || "none"} value={key}>
                    {key === "" ? "No key" : key}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="style_id" className="mb-2 block text-sm font-medium">
                Style
              </label>
              <select
                id="style_id"
                name="style_id"
                defaultValue=""
                className={inputClass}
              >
                <option value="">No style</option>
                {styleOptions.map((style) => (
                  <option key={style.id} value={style.id}>
                    {style.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="time_signature"
              className="mb-2 block text-sm font-medium"
            >
              Time signature
            </label>
            <input
              id="time_signature"
              name="time_signature"
              placeholder="e.g. 4/4 or 6/8"
              className={inputClass}
              pattern="^\\d+/\\d+$"
              title="Use format like 4/4 or 6/8"
            />
          </div>

          <div>
            <label htmlFor="composer" className="mb-2 block text-sm font-medium">
              Composer or source
            </label>
            <input
              id="composer"
              name="composer"
              placeholder="e.g. Bill Monroe, trad., unknown"
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="reference_url"
              className="mb-2 block text-sm font-medium"
            >
              Initial reference
            </label>
            <input
              id="reference_url"
              name="reference_url"
              type="url"
              placeholder="e.g. YouTube, archive, or recording link"
              className={inputClass}
            />
            <p className={helperClass}>
              Optional. Add one useful shared reference now, then add more
              Reference Media from Tune Detail.
            </p>
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-border bg-card px-6 py-5">
        <div className="flex justify-end">
          <SubmitButton
            label="Create"
            pendingLabel="Creating..."
            className="rounded-full border border-primary bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
      </div>
    </form>
  )
}
