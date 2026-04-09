import PendingLinkButton from "@/components/PendingLinkButton"
import CreateListModal from "@/components/CreateListModal"
import EditListModal from "@/components/EditListModal"
import MyTunesModal from "@/components/MyTunesModal"
import UnlistedKnownTunesModal from "@/components/UnlistedKnownTunesModal"
import UnlistedPracticeTunesModal from "@/components/UnlistedPracticeTunesModal"
import { addToLearningList, deleteList, removeTuneFromList, updateList } from "@/lib/actions/lists"
import { createClient } from "@/lib/supabase/server"
import type { Piece } from "@/lib/types"
import { redirect } from "next/navigation"

type LearningList = {
  id: number
  name: string
  description: string | null
  visibility: "private" | "public"
  is_imported: boolean
}

type UserPieceWithPiece = {
  id: number
  piece_id: number
  stage: number
  pieces:
    | {
        id: number
        title: string
      }
    | {
        id: number
        title: string
      }[]
    | null
}

type UserKnownPieceWithPiece = {
  id: number
  piece_id: number
  pieces:
    | {
        id: number
        title: string
      }
    | {
        id: number
        title: string
      }[]
    | null
}

type LearningListMembershipRow = {
  piece_id: number
}

type LearningListItemWithPieceRow = {
  learning_list_id: number
  pieces: Piece | Piece[] | null
}

type MyTuneRow = {
  piece_id: number
  title: string
  inPractice: boolean
  known: boolean
}

type LearningListsPageProps = {
  searchParams?: Promise<{
    create_list?: string
    edit_list?: string
  }>
}

function extractPieceTitle(
  piece:
    | {
        id: number
        title: string
      }
    | {
        id: number
        title: string
      }[]
    | null
) {
  if (!piece) return null
  if (Array.isArray(piece)) {
    return piece[0]?.title ?? null
  }
  return piece.title
}

function extractPiece(
  piece: Piece | Piece[] | null
): Piece | null {
  if (!piece) return null
  if (Array.isArray(piece)) {
    return piece[0] ?? null
  }
  return piece
}

export default async function LearningListsPage({
  searchParams,
}: LearningListsPageProps) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const resolvedSearchParams = await searchParams
  const createListStatus = resolvedSearchParams?.create_list ?? ""
  const editListStatus = resolvedSearchParams?.edit_list ?? ""

  const { data: learningLists, error } = await supabase
    .from("learning_lists")
    .select("id, name, description, visibility, is_imported")
    .eq("user_id", user.id)
    .order("id", { ascending: false })

  if (error) {
    return (
      <main className="p-8">
        <h1 className="text-3xl font-bold">Lists</h1>
        <p className="mt-4 text-red-600">Failed to load lists.</p>
      </main>
    )
  }

  const { data: userPieces } = await supabase
    .from("user_pieces")
    .select(`
      id,
      piece_id,
      stage,
      pieces (
        id,
        title
      )
    `)
    .eq("user_id", user.id)

  const { data: userKnownPieces } = await supabase
    .from("user_known_pieces")
    .select(`
      id,
      piece_id,
      pieces (
        id,
        title
      )
    `)
    .eq("user_id", user.id)

  const { data: learningListMemberships } = await supabase
    .from("learning_list_items")
    .select("piece_id, learning_lists!inner(user_id)")
    .eq("learning_lists.user_id", user.id)

  const { data: learningListItemsWithPieces } = await supabase
    .from("learning_list_items")
    .select(`
      learning_list_id,
      pieces (
        id,
        title,
        key,
        style,
        time_signature,
        reference_url
      ),
      learning_lists!inner(user_id)
    `)
    .eq("learning_lists.user_id", user.id)
    .order("position", { ascending: true })

  const typedLearningLists = (learningLists ?? []) as LearningList[]
  const typedUserPieces = (userPieces ?? []) as UserPieceWithPiece[]
  const typedUserKnownPieces =
    (userKnownPieces ?? []) as UserKnownPieceWithPiece[]
  const typedLearningListMemberships =
    (learningListMemberships ?? []) as LearningListMembershipRow[]
  const typedLearningListItemsWithPieces =
    (learningListItemsWithPieces ?? []) as LearningListItemWithPieceRow[]

  const listedPieceIds = new Set(
    typedLearningListMemberships.map((item) => item.piece_id)
  )

  const unlistedPracticeTunes = typedUserPieces.filter(
    (userPiece) => !listedPieceIds.has(userPiece.piece_id)
  )

  const unlistedKnownTunes = typedUserKnownPieces.filter(
    (userKnownPiece) => !listedPieceIds.has(userKnownPiece.piece_id)
  )

  const myTunesMap = new Map<number, MyTuneRow>()

  for (const userPiece of typedUserPieces) {
    const title = extractPieceTitle(userPiece.pieces)
    if (!title) continue

    const existing = myTunesMap.get(userPiece.piece_id)

    myTunesMap.set(userPiece.piece_id, {
      piece_id: userPiece.piece_id,
      title,
      inPractice: true,
      known: existing?.known ?? false,
    })
  }

  for (const userKnownPiece of typedUserKnownPieces) {
    const title = extractPieceTitle(userKnownPiece.pieces)
    if (!title) continue

    const existing = myTunesMap.get(userKnownPiece.piece_id)

    myTunesMap.set(userKnownPiece.piece_id, {
      piece_id: userKnownPiece.piece_id,
      title,
      inPractice: existing?.inPractice ?? false,
      known: true,
    })
  }

  const myTunes = Array.from(myTunesMap.values()).sort((a, b) =>
    a.title.localeCompare(b.title)
  )

  const tunesByListId = new Map<number, Piece[]>()

  for (const item of typedLearningListItemsWithPieces) {
    const piece = extractPiece(item.pieces)
    if (!piece) continue

    const existingTunes = tunesByListId.get(item.learning_list_id) ?? []
    existingTunes.push(piece)
    tunesByListId.set(item.learning_list_id, existingTunes)
  }

  return (
    <main className="p-8">
      <h1 className="mb-2 text-3xl font-bold">Lists</h1>
      <p className="mb-4 text-gray-600">Logged in as {user.email}</p>

      <CreateListModal />

      {createListStatus === "success" && (
        <div className="mb-6 rounded border border-green-600 bg-green-50 p-3 text-sm text-green-800">
          List created.
        </div>
      )}

      {createListStatus === "missing_name" && (
        <div className="mb-6 rounded border border-yellow-600 bg-yellow-50 p-3 text-sm text-yellow-800">
          Please enter a list name.
        </div>
      )}

      {createListStatus === "invalid_visibility" && (
        <div className="mb-6 rounded border border-yellow-600 bg-yellow-50 p-3 text-sm text-yellow-800">
          Invalid list visibility.
        </div>
      )}

      {createListStatus === "error" && (
        <div className="mb-6 rounded border border-red-600 bg-red-50 p-3 text-sm text-red-800">
          Could not create list.
        </div>
      )}

      {editListStatus === "success" && (
        <div className="mb-6 rounded border border-green-600 bg-green-50 p-3 text-sm text-green-800">
          List updated.
        </div>
      )}

      {editListStatus === "removed_tune" && (
        <div className="mb-6 rounded border border-green-600 bg-green-50 p-3 text-sm text-green-800">
          Tune removed from this list.
        </div>
      )}

      {editListStatus === "deleted" && (
        <div className="mb-6 rounded border border-green-600 bg-green-50 p-3 text-sm text-green-800">
          List deleted.
        </div>
      )}

      {editListStatus === "missing_list" && (
        <div className="mb-6 rounded border border-yellow-600 bg-yellow-50 p-3 text-sm text-yellow-800">
          Could not tell which list to edit.
        </div>
      )}

      {editListStatus === "missing_name" && (
        <div className="mb-6 rounded border border-yellow-600 bg-yellow-50 p-3 text-sm text-yellow-800">
          Please enter a list name.
        </div>
      )}

      {editListStatus === "missing_item" && (
        <div className="mb-6 rounded border border-yellow-600 bg-yellow-50 p-3 text-sm text-yellow-800">
          Could not tell which tune to remove from the list.
        </div>
      )}

      {editListStatus === "invalid_visibility" && (
        <div className="mb-6 rounded border border-yellow-600 bg-yellow-50 p-3 text-sm text-yellow-800">
          Invalid list visibility.
        </div>
      )}

      {editListStatus === "not_found" && (
        <div className="mb-6 rounded border border-red-600 bg-red-50 p-3 text-sm text-red-800">
          List not found or you do not own it.
        </div>
      )}

      {editListStatus === "error" && (
        <div className="mb-6 rounded border border-red-600 bg-red-50 p-3 text-sm text-red-800">
          Could not update list.
        </div>
      )}

      <section className="mb-6 rounded border p-4">
        <div>
          <h2 className="text-xl font-semibold">My Tunes</h2>
          <p className="mt-2 text-gray-600">Known and active learning tunes</p>

          <div className="mt-3">
            <span className="text-sm text-gray-500">
              {myTunes.length} tune{myTunes.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {myTunes.length === 0 ? (
          <p className="mt-4 text-sm text-gray-600">No tunes yet.</p>
        ) : (
          <div className="mt-4">
            <MyTunesModal myTunes={myTunes} />
          </div>
        )}
      </section>

      {typedLearningLists.length === 0 ? (
        <p className="text-gray-600">No lists yet.</p>
      ) : (
        <div className="space-y-4">
          {typedLearningLists.map((list) => {
            const tunes = tunesByListId.get(list.id) ?? []

            return (
              <section key={list.id} className="rounded border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold">{list.name}</h2>

                    {list.description && (
                      <p className="mt-2 text-gray-600">{list.description}</p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <PendingLinkButton
                        href={`/learning-lists/${list.id}`}
                        label="View List"
                        pendingLabel="Loading..."
                        className="text-sm underline"
                      />

                      <EditListModal
                        listId={list.id}
                        name={list.name}
                        description={list.description}
                        visibility={list.visibility}
                        redirectTo="/learning-lists"
                        tunes={tunes}
                        updateList={updateList}
                        removeTuneFromList={removeTuneFromList}
                        deleteList={deleteList}
                        triggerLabel="Manage List"
                      />
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-sm text-gray-500">
                      {list.visibility === "public" ? "Public" : "Private"}
                    </div>

                    {list.is_imported && (
                      <div className="mt-1 text-sm text-gray-500">
                        Imported
                      </div>
                    )}

                    <div className="mt-1 text-sm text-gray-500">
                      {tunes.length} tune{tunes.length === 1 ? "" : "s"}
                    </div>
                  </div>
                </div>
              </section>
            )
          })}
        </div>
      )}

      <UnlistedPracticeTunesModal
        unlistedPracticeTunes={unlistedPracticeTunes}
        learningLists={typedLearningLists}
        addToLearningList={addToLearningList}
        redirectTo="/learning-lists"
      />

      <UnlistedKnownTunesModal
        unlistedKnownTunes={unlistedKnownTunes}
        learningLists={typedLearningLists}
        addToLearningList={addToLearningList}
        redirectTo="/learning-lists"
      />
    </main>
  )
}