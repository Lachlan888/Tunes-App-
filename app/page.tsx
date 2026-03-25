import ActiveLearningSection from "@/components/ActiveLearningSection"
import CreateTuneForm from "@/components/CreateTuneForm"
import DueTodaySection from "@/components/DueTodaySection"
import {
  addToLearningList,
  createList,
  createTune,
  startLearning,
} from "@/lib/actions/homepage"
import { markShaky, markSolid } from "@/lib/actions/reviews"
import { loadHomepageData } from "@/lib/loaders/homepage"

type Piece = {
  id: number
  title: string
  key: string | null
  style: string | null
  time_signature: string | null
}

type LearningListItem = {
  id: number
  position: number | null
  pieces: Piece | Piece[] | null
}

type LearningList = {
  id: number
  name: string
  description: string | null
  learning_list_items: LearningListItem[]
}

type UserPiece = {
  id: number
  piece_id: number
  status: string
  next_review_due: string | null
  stage: number
}

export default async function HomePage() {
  const { user, learningLists, pieces, userPieces, dueToday } =
    await loadHomepageData()

  return (
    <main className="p-8">
      <h1 className="mb-2 text-3xl font-bold">Tunes App</h1>
      <p className="mb-6 text-gray-600">Logged in as {user.email}</p>

      <form action={createList} className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold">Create Learning List</h2>

        <input
          name="name"
          placeholder="List name"
          className="mb-2 w-full border p-2"
          required
        />

        <input
          name="description"
          placeholder="Description"
          className="mb-2 w-full border p-2"
        />

        <button className="bg-black px-4 py-2 text-white">
          Create
        </button>
      </form>

      <CreateTuneForm createTune={createTune} />

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold">Add Tune to Learning List</h2>

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
            <option value="">Select a learning list</option>
            {learningLists?.map((list: LearningList) => (
              <option key={list.id} value={list.id}>
                {list.name}
              </option>
            ))}
          </select>

          <button className="bg-black px-4 py-2 text-white">
            Add Tune
          </button>
        </form>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold">Learning Lists</h2>

        {!learningLists || learningLists.length === 0 ? (
          <p className="text-gray-600">
            No learning lists found for this user yet.
          </p>
        ) : (
          learningLists.map((list: LearningList) => {
            const sortedItems = [...(list.learning_list_items || [])].sort((a, b) => {
              if (a.position == null && b.position == null) return 0
              if (a.position == null) return 1
              if (b.position == null) return -1
              return a.position - b.position
            })

            return (
              <div key={list.id} className="mb-6">
                <h3 className="text-xl font-medium">{list.name}</h3>
                {list.description && (
                  <p className="mb-2 text-gray-600">{list.description}</p>
                )}

                <ul className="list-disc pl-6">
                  {sortedItems.map((item: LearningListItem) => {
                    const piece = Array.isArray(item.pieces)
                      ? item.pieces[0]
                      : item.pieces

                    if (!piece) return null

                    const alreadyStarted = userPieces?.some(
                      (userPiece: UserPiece) => userPiece.piece_id === piece.id
                    )

                    return (
                      <li key={item.id} className="mb-2">
                        <div>
                          {piece.title}
                          {piece.key ? `, key ${piece.key}` : ""}
                          {piece.style ? `, ${piece.style}` : ""}
                          {piece.time_signature ? `, ${piece.time_signature}` : ""}
                        </div>

                        {alreadyStarted ? (
                          <p className="text-sm text-gray-600">Already in active learning</p>
                        ) : (
                          <form action={startLearning} className="mt-1">
                            <input type="hidden" name="piece_id" value={piece.id} />
                            <button className="bg-black px-3 py-1 text-sm text-white">
                              Start Learning
                            </button>
                          </form>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })
        )}
      </section>

      <DueTodaySection
        dueToday={dueToday}
        pieces={pieces}
        markSolid={markSolid}
        markShaky={markShaky}
      />

      <ActiveLearningSection userPieces={userPieces} pieces={pieces} />

      <section>
        <h2 className="mb-4 text-2xl font-semibold">All Tunes</h2>

        <ul className="list-disc pl-6">
          {pieces?.map((piece: Piece) => (
            <li key={piece.id}>
              {piece.title}
              {piece.key ? `, key ${piece.key}` : ""}
              {piece.style ? `, ${piece.style}` : ""}
              {piece.time_signature ? `, ${piece.time_signature}` : ""}
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}