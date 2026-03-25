import ActiveLearningSection from "@/components/ActiveLearningSection"
import AddToLearningListSection from "@/components/AddToLearningListSection"
import CreateTuneForm from "@/components/CreateTuneForm"
import LearningListsSection from "@/components/LearningListsSection"
import {
  addToLearningList,
  createList,
  createTune,
} from "@/lib/actions/homepage"
import { startLearning } from "@/lib/actions/user-pieces"
import { loadHomepageData } from "@/lib/loaders/homepage"

export default async function HomePage() {
  const { user, learningLists, pieces, userPieces } =
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

        <button className="bg-black px-4 py-2 text-white">Create</button>
      </form>

      <CreateTuneForm createTune={createTune} />

      <AddToLearningListSection
        pieces={pieces}
        learningLists={learningLists}
        addToLearningList={addToLearningList}
      />

      <LearningListsSection
        learningLists={learningLists}
        userPieces={userPieces}
        startLearning={startLearning}
      />

      <ActiveLearningSection userPieces={userPieces} pieces={pieces} />
    </main>
  )
}