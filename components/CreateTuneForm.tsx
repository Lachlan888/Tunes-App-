import SubmitButton from "@/components/SubmitButton"

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

const KEY_OPTIONS = [
  "",
  "A",
  "Am",
  "A modal",
  "Bb",
  "Bbm",
  "B",
  "Bm",
  "C",
  "Cm",
  "C modal",
  "D",
  "Dm",
  "D modal",
  "Eb",
  "Ebm",
  "E",
  "Em",
  "E modal",
  "F",
  "Fm",
  "F modal",
  "F#",
  "F#m",
  "G",
  "Gm",
  "G modal",
  "Ab",
  "Abm",
]

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
    >
      <input type="hidden" name="redirect_to" value={redirectTo} />

      <input
        name="title"
        placeholder="Tune title"
        className="mb-2 w-full border p-2"
        required
      />

      <label htmlFor="key" className="mb-2 block text-sm font-medium">
        Key
      </label>
      <select
        id="key"
        name="key"
        defaultValue=""
        className="mb-4 w-full border p-2"
      >
        <option value="">No key</option>
        {KEY_OPTIONS.filter((key) => key !== "").map((key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>

      <fieldset className="mb-4 border p-3">
        <legend className="px-1 font-medium">Styles</legend>

        <div className="grid gap-2 sm:grid-cols-2">
          {styleOptions.map((style) => (
            <label key={style.id} className="flex items-center gap-2">
              <input type="checkbox" name="style_ids" value={style.id} />
              <span>{style.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <input
        name="time_signature"
        placeholder="Time signature"
        className="mb-2 w-full border p-2"
        pattern="^\d+/\d+$"
        title="Use format like 4/4 or 6/8"
      />

      <input
        name="reference_url"
        placeholder="Reference URL"
        className="mb-4 w-full border p-2"
      />

      <SubmitButton
        label="Create"
        pendingLabel="Creating..."
        className="bg-black px-4 py-2 text-white"
      />
    </form>
  )
}