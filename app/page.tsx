import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

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

export default async function HomePage() {
  async function createList(formData: FormData) {
    "use server"

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/login")
    }

    const name = formData.get("name") as string
    const description = formData.get("description") as string

    await supabase.from("learning_lists").insert({
      name,
      description,
      user_id: user.id,
    })

    redirect("/")
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: learningLists } = await supabase
    .from("learning_lists")
    .select(`
      id,
      name,
      description,
      learning_list_items (
        id,
        position,
        pieces (
          id,
          title,
          key,
          style,
          time_signature
        )
      )
    `)
    .eq("user_id", user.id)

  const { data: pieces } = await supabase
    .from("pieces")
    .select("id, title, key, style, time_signature")
    .order("title")

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-2">Tunes App</h1>
      <p className="text-gray-600 mb-6">Logged in as {user.email}</p>

      <form action={createList} className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Create Learning List</h2>

        <input
          name="name"
          placeholder="List name"
          className="border p-2 w-full mb-2"
          required
        />

        <input
          name="description"
          placeholder="Description"
          className="border p-2 w-full mb-2"
        />

        <button className="bg-black text-white px-4 py-2">
          Create
        </button>
      </form>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Learning Lists</h2>

        {!learningLists || learningLists.length === 0 ? (
          <p className="text-gray-600">
            No learning lists found for this user yet.
          </p>
        ) : (
          learningLists.map((list: LearningList) => (
            <div key={list.id} className="mb-6">
              <h3 className="text-xl font-medium">{list.name}</h3>
              {list.description && (
                <p className="text-gray-600 mb-2">{list.description}</p>
              )}

              <ul className="list-disc pl-6">
                {list.learning_list_items?.map((item: LearningListItem) => {
                  const piece = Array.isArray(item.pieces)
                    ? item.pieces[0]
                    : item.pieces

                  if (!piece) return null

                  return (
                    <li key={item.id}>
                      {piece.title}
                      {piece.key ? `, key ${piece.key}` : ""}
                      {piece.style ? `, ${piece.style}` : ""}
                      {piece.time_signature ? `, ${piece.time_signature}` : ""}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">All Tunes</h2>

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