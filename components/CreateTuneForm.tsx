type CreateTuneFormProps = {
  createTune: (formData: FormData) => void | Promise<void>
  redirectTo?: string
}

export default function CreateTuneForm({
  createTune,
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

      <input
        name="style"
        placeholder="Style"
        className="mb-2 w-full border p-2"
      />

      <input
        name="time_signature"
        placeholder="Time signature"
        className="mb-2 w-full border p-2"
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