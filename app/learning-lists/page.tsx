import Link from "next/link"
import CreateListModal from "@/components/CreateListModal"
import UnlistedKnownTunesModal from "@/components/UnlistedKnownTunesModal"
import UnlistedPracticeTunesModal from "@/components/UnlistedPracticeTunesModal"
import { createClient } from "@/lib/supabase/server"
import { toggleLearningListVisibility } from "@/lib/actions/learning-lists"
import { addToLearningList } from "@/lib/actions/lists"
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

type LearningListItem = {
  piece_id: number
}

type LearningListsPageProps = {
  searchParams?: Promise<{
    create_list?: string
  }>
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

  const { data: learningListItems } = await supabase
    .from("learning_list_items")
    .select("piece_id, learning_lists!inner(user_id)")
    .eq("learning_lists.user_id", user.id)

  const typedLearningLists = (learningLists ?? []) as LearningList[]
  const typedUserPieces = (userPieces ?? []) as UserPieceWithPiece[]
  const typedUserKnownPieces =
    (userKnownPieces ?? []) as UserKnownPieceWithPiece[]
  const typedLearningListItems = (learningListItems ?? []) as LearningListItem[]

  const listedPieceIds = new Set(
    typedLearningListItems.map((item) => item.piece_id)
  )

  const unlistedPracticeTunes = typedUserPieces.filter(
    (userPiece) => !listedPieceIds.has(userPiece.piece_id)
  )

  const unlistedKnownTunes = typedUserKnownPieces.filter(
    (userKnownPiece) => !listedPieceIds.has(userKnownPiece.piece_id)
  )

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

      {createListStatus === "error" && (
        <div className="mb-6 rounded border border-red-600 bg-red-50 p-3 text-sm text-red-800">
          Could not create list.
        </div>
      )}

      {typedLearningLists.length === 0 ? (
        <p className="text-gray-600">No lists yet.</p>
      ) : (
        <div className="space-y-4">
          {typedLearningLists.map((list) => (
            <section key={list.id} className="rounded border p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{list.name}</h2>

                  {list.description && (
                    <p className="mt-2 text-gray-600">{list.description}</p>
                  )}

                  <div className="mt-3">
                    <Link
                      href={`/learning-lists/${list.id}`}
                      className="text-sm underline"
                    >
                      View List
                    </Link>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    {list.visibility === "public" ? "Public" : "Private"}
                  </span>

                  {list.visibility === "private" ? (
                    list.is_imported ? (
                      <span className="text-sm text-gray-500">
                        Imported lists stay private
                      </span>
                    ) : (
                      <form action={toggleLearningListVisibility}>
                        <input type="hidden" name="list_id" value={list.id} />
                        <input
                          type="hidden"
                          name="next_visibility"
                          value="public"
                        />
                        <button
                          type="submit"
                          className="rounded border px-3 py-1 text-sm"
                        >
                          Make Public
                        </button>
                      </form>
                    )
                  ) : (
                    <form action={toggleLearningListVisibility}>
                      <input type="hidden" name="list_id" value={list.id} />
                      <input
                        type="hidden"
                        name="next_visibility"
                        value="private"
                      />
                      <button
                        type="submit"
                        className="rounded border px-3 py-1 text-sm"
                      >
                        Make Private
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </section>
          ))}
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