type StyleOption = {
  id: number
  slug: string
  label: string
}

type CreateTuneFormProps = {
  createTune: (formData: FormData) => void | Promise<void>
  styleOptions: StyleOption[]
  redirectTo?: string
}

export default function CreateTuneForm({
  createTune,
  styleOptions,
  redirectTo = "/library",
}: CreateTuneFormProps) {
  return (
    <form action={createTune}>
      <input type="hidden" name="redirect_to" value={redirectTo} />

      <input
        name="title"
        placeholder="Tune title"
        className="mb-2 w-full border p-2"
        required
      />

      <input
        name="key"
        placeholder="Key"
        className="mb-2 w-full border p-2"
      />

      <fieldset className="mb-4 border p-3">
        <legend className="px-1 font-medium">Styles</legend>

        <div className="grid gap-2 sm:grid-cols-2">
          {styleOptions.map((style) => (
            <label key={style.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                name="style_ids"
                value={style.id}
              />
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

      <button className="bg-black px-4 py-2 text-white">Create</button>
    </form>
  )
}