import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { startLearning } from "@/lib/actions/user-pieces"

type LearningListRow = {
  id: number
  user_id: string
  name: string
  description: string | null
  visibility: "private" | "public"
  is_imported: boolean
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

export default async function LearningListDetailPage({
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: list, error: listError } = await supabase
    .from("learning_lists")
    .select("id, user_id, name, description, visibility, is_imported")
    .eq("id", listId)
    .eq("user_id", user.id)
    .single()

  if (listError || !list) {
    notFound()
  }

  const typedList = list as LearningListRow

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

  const pieceIds = typedItems
    .map((item) => {
      const piece = Array.isArray(item.pieces) ? item.pieces[0] : item.pieces
      return piece?.id ?? null
    })
    .filter((id): id is number => id !== null)

  let activePieceIds = new Set<number>()

  if (pieceIds.length > 0) {
    const { data: userPieces, error: userPiecesError } = await supabase
      .from("user_pieces")
      .select("piece_id")
      .eq("user_id", user.id)
      .in("piece_id", pieceIds)

    if (userPiecesError) {
      return (
        <main className="p-6 max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">{typedList.name}</h1>
          <p>Could not load practice state.</p>
          <p className="text-sm text-red-600 mt-2">{userPiecesError.message}</p>
        </main>
      )
    }

    activePieceIds = new Set((userPieces ?? []).map((row) => row.piece_id))
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{typedList.name}</h1>

      <div className="mb-4 flex gap-3 text-sm text-gray-600">
        <span>{typedList.visibility === "public" ? "Public" : "Private"}</span>
        {typedList.is_imported && <span>Imported</span>}
      </div>

      {typedList.description && (
        <p className="text-sm mb-6">{typedList.description}</p>
      )}

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

            const isAlreadyInPractice = activePieceIds.has(piece.id)

            return (
              <div
                key={item.id}
                className="border rounded-lg p-4 bg-white shadow-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-medium">{piece.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {piece.key ?? "Unknown key"} •{" "}
                      {piece.time_signature ?? "Unknown time"} •{" "}
                      {piece.style ?? "Unknown style"}
                    </p>
                  </div>

                  {isAlreadyInPractice ? (
                    <span className="text-sm text-gray-500">
                      Already in practice
                    </span>
                  ) : (
                    <form action={startLearning}>
                      <input type="hidden" name="piece_id" value={piece.id} />
                      <input
                        type="hidden"
                        name="redirect_to"
                        value={`/learning-lists/${typedList.id}`}
                      />
                      <button
                        type="submit"
                        className="rounded border px-3 py-1 text-sm"
                      >
                        Start Practice
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}