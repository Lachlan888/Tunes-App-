import SubmitButton from "@/components/SubmitButton"

type CreateListFormProps = {
  createList: (formData: FormData) => void | Promise<void>
  redirectTo?: string
  onSubmitStart?: () => void
}

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
    >
      <input type="hidden" name="redirect_to" value={redirectTo} />

      <input
        name="name"
        placeholder="List name"
        className="mb-2 w-full border p-2"
        required
      />

      <input
        name="description"
        placeholder="Description"
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