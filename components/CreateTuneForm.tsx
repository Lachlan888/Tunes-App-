type CreateTuneFormProps = {
  createTune: (formData: FormData) => Promise<void>
}

export default function CreateTuneForm({
  createTune,
}: CreateTuneFormProps) {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-4">Create New Tune</h2>

      <form action={createTune}>
        <input
          name="title"
          placeholder="Tune title"
          className="border p-2 w-full mb-2"
          required
        />

        <input
          name="key"
          placeholder="Key"
          className="border p-2 w-full mb-2"
        />

        <input
          name="style"
          placeholder="Style"
          className="border p-2 w-full mb-2"
        />

        <input
          name="time_signature"
          placeholder="Time signature"
          className="border p-2 w-full mb-2"
        />

        <button className="bg-black text-white px-4 py-2">
          Create Tune
        </button>
      </form>
    </section>
  )
}