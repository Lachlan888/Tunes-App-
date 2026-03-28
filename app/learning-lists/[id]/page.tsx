import { notFound, redirect } from "next/navigation"
import RemoveTuneButton from "@/components/RemoveTuneButton"
import TuneCard from "@/components/TuneCard"
import { createClient } from "@/lib/supabase/server"
import { markAsKnown } from "@/lib/actions/known-pieces"
import { removeTuneFromMyApp } from "@/lib/actions/pieces"
import { startLearning } from "@/lib/actions/user-pieces"
import type { Piece } from "@/lib/types"

type LearningListRow = {
  id: number
  user_id: string
  name: string
  description: string | null
  visibility: "private" | "public"
  is_imported: boolean
}

type LearningListItemRow = {
  id: number
  position: number | null
  pieces: Piece | Piece[] | null
}

type LearningListDetailPageProps = {
  params: Promise<{ id: string }>
  searchParams?: Promise<{
    remove_tune?: string
  }>
}

export default async function LearningListDetailPage({
  params,
  searchParams,
}: LearningListDetailPageProps) {
  const { id } = await params
  const listId = Number(id)

  if (Number.isNaN(listId)) {
    notFound()
  }

  const resolvedSearchParams = await searchParams
  const removeTuneStatus = resolvedSearchParams?.remove_tune ?? ""

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
  const redirectTo = `/learning-lists/${typedList.id}`

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
        time_signature,
        reference_url
      )
    `)
    .eq("learning_list_id", listId)
    .order("position", { ascending: true })

  if (itemsError) {
    return (
      <main className="p-6 max-w-4xl mx-auto">
        <h1 className="mb-4 text-2xl font-bold">{typedList.name}</h1>
        <p>Could not load list items.</p>
        <p className="mt-2 text-sm text-red-600">{itemsError.message}</p>
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
  let knownPieceIds = new Set<number>()

  if (pieceIds.length > 0) {
    const { data: userPieces, error: userPiecesError } = await supabase
      .from("user_pieces")
      .select("piece_id")
      .eq("user_id", user.id)
      .in("piece_id", pieceIds)

    if (userPiecesError) {
      return (
        <main className="p-6 max-w-4xl mx-auto">
          <h1 className="mb-4 text-2xl font-bold">{typedList.name}</h1>
          <p>Could not load practice state.</p>
          <p className="mt-2 text-sm text-red-600">{userPiecesError.message}</p>
        </main>
      )
    }

    activePieceIds = new Set((userPieces ?? []).map((row) => row.piece_id))

    const { data: userKnownPieces, error: userKnownPiecesError } = await supabase
      .from("user_known_pieces")
      .select("piece_id")
      .eq("user_id", user.id)
      .in("piece_id", pieceIds)

    if (userKnownPiecesError) {
      return (
        <main className="p-6 max-w-4xl mx-auto">
          <h1 className="mb-4 text-2xl font-bold">{typedList.name}</h1>
          <p>Could not load known state.</p>
          <p className="mt-2 text-sm text-red-600">
            {userKnownPiecesError.message}
          </p>
        </main>
      )
    }

    knownPieceIds = new Set((userKnownPieces ?? []).map((row) => row.piece_id))
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-2 text-2xl font-bold">{typedList.name}</h1>

      <div className="mb-4 flex gap-3 text-sm text-gray-600">
        <span>{typedList.visibility === "public" ? "Public" : "Private"}</span>
        {typedList.is_imported && <span>Imported</span>}
      </div>

      {typedList.description && (
        <p className="mb-6 text-sm">{typedList.description}</p>
      )}

      {removeTuneStatus === "success" && (
        <div className="mb-6 rounded border border-green-600 bg-green-50 p-3 text-sm text-green-800">
          Tune removed from your app.
        </div>
      )}

      {removeTuneStatus === "missing_piece" && (
        <div className="mb-6 rounded border border-yellow-600 bg-yellow-50 p-3 text-sm text-yellow-800">
          Could not tell which tune to remove.
        </div>
      )}

      {removeTuneStatus === "error" && (
        <div className="mb-6 rounded border border-red-600 bg-red-50 p-3 text-sm text-red-800">
          Could not remove tune.
        </div>
      )}

      <h2 className="mb-3 text-lg font-semibold">Tunes</h2>

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
            const isKnown = knownPieceIds.has(piece.id)

            return (
              <div key={item.id}>
                <TuneCard
                  title={piece.title}
                  keyValue={piece.key}
                  style={piece.style}
                  timeSignature={piece.time_signature}
                  referenceUrl={piece.reference_url}
                  listNames={[]}
                >
                  {isAlreadyInPractice ? (
                    <p className="text-sm text-gray-600">Already in practice</p>
                  ) : (
                    <form action={startLearning}>
                      <input type="hidden" name="piece_id" value={piece.id} />
                      <input
                        type="hidden"
                        name="redirect_to"
                        value={redirectTo}
                      />
                      <button className="bg-black px-3 py-1 text-sm text-white">
                        Start Practice
                      </button>
                    </form>
                  )}

                  {!isAlreadyInPractice &&
                    (isKnown ? (
                      <p className="text-sm text-gray-600">Known</p>
                    ) : (
                      <form action={markAsKnown}>
                        <input type="hidden" name="piece_id" value={piece.id} />
                        <button className="border px-3 py-1 text-sm">
                          Mark as known
                        </button>
                      </form>
                    ))}

                  <RemoveTuneButton
                    pieceId={piece.id}
                    redirectTo={redirectTo}
                    removeTuneFromMyApp={removeTuneFromMyApp}
                  />
                </TuneCard>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}