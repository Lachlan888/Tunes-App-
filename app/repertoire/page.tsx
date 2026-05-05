import AddToListSection from "@/components/AddToListSection"
import CreateTuneForm from "@/components/library/CreateTuneForm"
import { addToLearningList, createList } from "@/lib/actions/lists"
import { createTune } from "@/lib/actions/pieces"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

type StyleOption = {
  id: number
  slug: string
  label: string
}

type PieceOption = {
  id: number
  title: string
  key: string | null
  style: string | null
  time_signature: string | null
}

type LearningListOption = {
  id: number
  name: string
  description: string | null
  learning_list_items: unknown[]
}

export default async function RepertoirePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const [
    { data: styleRows, error: stylesError },
    { data: learningLists, error: learningListsError },
    { data: pieces, error: piecesError },
  ] = await Promise.all([
    supabase
      .from("styles")
      .select("id, slug, label")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),

    supabase
      .from("learning_lists")
      .select("id, name, description, learning_list_items(id)")
      .eq("user_id", user.id)
      .order("name", { ascending: true }),

    supabase
      .from("pieces")
      .select("id, title, key, style, time_signature")
      .order("title", { ascending: true }),
  ])

  if (learningListsError) {
    throw new Error(learningListsError.message)
  }

  if (piecesError) {
    throw new Error(piecesError.message)
  }

  const styleOptions: StyleOption[] = stylesError ? [] : styleRows ?? []

  const typedLearningLists = (learningLists ?? []) as LearningListOption[]
  const typedPieces = (pieces ?? []) as PieceOption[]

  const learningListOptions = typedLearningLists.map((list) => ({
    id: list.id,
    name: list.name,
  }))

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
        redirectTo="/repertoire"
      />

      <AddToListSection
        pieces={typedPieces}
        learningLists={typedLearningLists}
        addToLearningList={addToLearningList}
      />
    </main>
  )
}