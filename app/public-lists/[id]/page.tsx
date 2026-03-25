import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

type LearningListRow = {
  id: number
  user_id: string
  name: string
  description: string | null
  visibility: string
}

type ProfileRow = {
  id: string
  username: string | null
}

type PieceRow = {
  id: number
  title: string
  key: string | null
  style: string | null
  time_signature: string | null
}

type LearningListItemRow = {
  id: number
  position: number | null
  pieces: PieceRow | PieceRow[] | null
}

async function importPublicList(formData: FormData) {
  "use server"

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const sourceListId = Number(formData.get("sourceListId"))

  if (Number.isNaN(sourceListId)) {
    throw new Error("Invalid source list id")
  }

  const { data: sourceList, error: sourceListError } = await supabase
    .from("learning_lists")
    .select("id, name, visibility")
    .eq("id", sourceListId)
    .eq("visibility", "public")
    .single()

  if (sourceListError || !sourceList) {
    throw new Error("Public list not found")
  }

  const { data: sourceItems, error: sourceItemsError } = await supabase
    .from("learning_list_items")
    .select("piece_id, position")
    .eq("learning_list_id", sourceListId)
    .order("position", { ascending: true })

  if (sourceItemsError) {
    throw new Error(sourceItemsError.message)
  }

  const { data: newList, error: newListError } = await supabase
    .from("learning_lists")
    .insert({
      user_id: user.id,
      name: `${sourceList.name} (Imported)`,
      description: null,
      visibility: "private",
      is_imported: true,
    })
    .select("id")
    .single()

  if (newListError || !newList) {
    throw new Error(newListError?.message ?? "Could not create new list")
  }

  if (sourceItems && sourceItems.length > 0) {
    const copiedItems = sourceItems.map((item) => ({
      learning_list_id: newList.id,
      piece_id: item.piece_id,
      position: item.position,
    }))

    const { error: copyItemsError } = await supabase
      .from("learning_list_items")
      .insert(copiedItems)

    if (copyItemsError) {
      throw new Error(copyItemsError.message)
    }
  }

  redirect("/learning-lists")
}

export default async function PublicListDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const listId = Number(id)

  if (Number.isNaN(listId)) {
    notFound()
  }

  const supabase = await createClient()

  const { data: list, error: listError } = await supabase
    .from("learning_lists")
    .select("id, user_id, name, description, visibility")
    .eq("id", listId)
    .eq("visibility", "public")
    .single()

  if (listError || !list) {
    notFound()
  }

  const typedList = list as LearningListRow

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("id", typedList.user_id)
    .maybeSingle()

  const owner = profile as ProfileRow | null

  const { data: items, error: itemsError } = await supabase
    .from("learning_list_items")
    .select(`
      id,
      position,
      pieces (
        id,
        title,
        key,
        style,
        time_signature
      )
    `)
    .eq("learning_list_id", listId)
    .order("position", { ascending: true })

  if (itemsError) {
    return (
      <main className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">{typedList.name}</h1>
        <p>Could not load list items.</p>
        <p className="text-sm text-red-600 mt-2">{itemsError.message}</p>
      </main>
    )
  }

  const typedItems = (items ?? []) as LearningListItemRow[]

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{typedList.name}</h1>

      <p className="text-sm text-gray-600 mb-2">
        By {owner?.username ?? "Unknown user"}
      </p>

      {typedList.description && (
        <p className="text-sm mb-6">{typedList.description}</p>
      )}

      <form action={importPublicList} className="mb-6">
        <input type="hidden" name="sourceListId" value={typedList.id} />
        <button
          type="submit"
          className="rounded border px-4 py-2 text-sm font-medium"
        >
          Import this list
        </button>
      </form>

      <h2 className="text-lg font-semibold mb-3">Tunes</h2>

      {typedItems.length === 0 ? (
        <p>This list has no tunes yet.</p>
      ) : (
        <div className="space-y-3">
          {typedItems.map((item) => {
            const piece = Array.isArray(item.pieces)
              ? item.pieces[0]
              : item.pieces

            if (!piece) return null

            return (
              <div
                key={item.id}
                className="border rounded-lg p-4 bg-white shadow-sm"
              >
                <h3 className="font-medium">{piece.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {piece.key ?? "Unknown key"} •{" "}
                  {piece.time_signature ?? "Unknown time"} •{" "}
                  {piece.style ?? "Unknown style"}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}