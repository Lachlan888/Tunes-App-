import AddToListSection from "@/components/AddToListSection"
import CreateTuneForm from "@/components/CreateTuneForm"
import { addToLearningList, createList } from "@/lib/actions/lists"
import { createTune } from "@/lib/actions/pieces"
import { loadHomepageData } from "@/lib/loaders/homepage"
import { createClient } from "@/lib/supabase/server"

type StyleOption = {
  id: number
  slug: string
  label: string
}

type LearningListOption = {
  id: number
  name: string
}

export default async function RepertoirePage() {
  const { user, learningLists, pieces } = await loadHomepageData()

  const supabase = await createClient()

  const { data: styleRows, error: stylesError } = await supabase
    .from("styles")
    .select("id, slug, label")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  const styleOptions: StyleOption[] = stylesError ? [] : styleRows ?? []

  const learningListOptions: LearningListOption[] = (learningLists ?? []).map(
    (list) => ({
      id: list.id,
      name: list.name,
    })
  )

  return (
    <main className="p-8">
      <h1 className="mb-2 text-3xl font-bold">Manage Library</h1>
      <p className="mb-6 text-gray-600">Logged in as {user.email}</p>

      <form action={createList} className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold">Create List</h2>

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

      <CreateTuneForm
        createTune={createTune}
        styleOptions={styleOptions}
        learningLists={learningListOptions}
      />

      <AddToListSection
        pieces={pieces}
        learningLists={learningLists}
        addToLearningList={addToLearningList}
      />
    </main>
  )
}