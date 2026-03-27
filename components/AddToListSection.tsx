type Piece = {
  id: number
  title: string
  key: string | null
  style: string | null
  time_signature: string | null
}

type LearningList = {
  id: number
  name: string
  description: string | null
  learning_list_items: unknown[]
}

type AddToListSectionProps = {
  pieces: Piece[] | null
  learningLists: LearningList[] | null
  addToLearningList: (formData: FormData) => Promise<void>
}

export default function AddToListSection({
  pieces,
  learningLists,
  addToLearningList,
}: AddToListSectionProps) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 text-2xl font-semibold">Add Tune to List</h2>

      <form action={addToLearningList}>
        <select
          name="piece_id"
          className="mb-2 w-full border p-2"
          required
        >
          <option value="">Select a tune</option>
          {pieces?.map((piece: Piece) => (
            <option key={piece.id} value={piece.id}>
              {piece.title}
            </option>
          ))}
        </select>

        <select
          name="learning_list_id"
          className="mb-2 w-full border p-2"
          required
        >
          <option value="">Select a list</option>
          {learningLists?.map((list: LearningList) => (
            <option key={list.id} value={list.id}>
              {list.name}
            </option>
          ))}
        </select>

        <button className="bg-black px-4 py-2 text-white">Add Tune</button>
      </form>
    </section>
  )
}