import ActiveLearningSection from "@/components/ActiveLearningSection"
import CreateTuneForm from "@/components/CreateTuneForm"
import DueTodaySection from "@/components/DueTodaySection"
import {
  getNextReviewDateFromStage,
  getNextStageForShaky,
  getNextStageForSolid,
  getTomorrow,
  isDueToday,
} from "@/lib/review"
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

type UserPiece = {
  id: number
  piece_id: number
  status: string
  next_review_due: string | null
  stage: number
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

  async function createTune(formData: FormData) {
    "use server"

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/login")
    }

    const title = formData.get("title") as string
    const key = formData.get("key") as string
    const style = formData.get("style") as string
    const time_signature = formData.get("time_signature") as string

    const { error } = await supabase.from("pieces").insert({
      title,
      key: key || null,
      style: style || null,
      time_signature: time_signature || null,
    })

    if (error) {
      throw new Error(error.message)
    }

    redirect("/")
  }

  async function addToLearningList(formData: FormData) {
    "use server"

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/login")
    }

    const piece_id = Number(formData.get("piece_id"))
    const learning_list_id = Number(formData.get("learning_list_id"))

    const { data: existingItems, error: fetchError } = await supabase
      .from("learning_list_items")
      .select("position")
      .eq("learning_list_id", learning_list_id)
      .not("position", "is", null)
      .order("position", { ascending: false })
      .limit(1)

    if (fetchError) {
      throw new Error(fetchError.message)
    }

    const nextPosition =
      existingItems && existingItems.length > 0 && existingItems[0].position != null
        ? existingItems[0].position + 1
        : 1

    const { error: insertError } = await supabase.from("learning_list_items").insert({
      piece_id,
      learning_list_id,
      position: nextPosition,
    })

    if (insertError) {
      throw new Error(insertError.message)
    }

    redirect("/")
  }

  async function startLearning(formData: FormData) {
    "use server"

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/login")
    }

    const piece_id = Number(formData.get("piece_id"))
    const nextReviewDue = getTomorrow()

    const { data: existingUserPiece, error: fetchError } = await supabase
      .from("user_pieces")
      .select("id")
      .eq("user_id", user.id)
      .eq("piece_id", piece_id)
      .maybeSingle()

    if (fetchError) {
      throw new Error(fetchError.message)
    }

    if (existingUserPiece) {
      redirect("/")
    }

    const { error } = await supabase.from("user_pieces").insert({
      user_id: user.id,
      piece_id,
      status: "learning",
      stage: 1,
      next_review_due: nextReviewDue,
    })

    if (error) {
      throw new Error(error.message)
    }

    redirect("/")
  }

  async function markSolid(formData: FormData) {
    "use server"

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/login")
    }

    const userPieceId = Number(formData.get("userPieceId"))

    const { data: userPiece, error: fetchError } = await supabase
      .from("user_pieces")
      .select("id, user_id, stage")
      .eq("id", userPieceId)
      .eq("user_id", user.id)
      .single()

    if (fetchError) {
      throw new Error(fetchError.message)
    }

    const newStage = getNextStageForSolid(userPiece.stage)
    const nextReviewDue = getNextReviewDateFromStage(newStage)

    const { error: updateError } = await supabase
      .from("user_pieces")
      .update({
        stage: newStage,
        next_review_due: nextReviewDue,
        status: "learning",
      })
      .eq("id", userPieceId)
      .eq("user_id", user.id)

    if (updateError) {
      throw new Error(updateError.message)
    }

    const { error: reviewEventError } = await supabase
      .from("review_events")
      .insert({
        user_piece_id: userPieceId,
        outcome: "solid",
        resulting_stage: newStage,
      })

    if (reviewEventError) {
      throw new Error(reviewEventError.message)
    }

    redirect("/")
  }

  async function markShaky(formData: FormData) {
    "use server"

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/login")
    }

    const userPieceId = Number(formData.get("userPieceId"))

    const { data: userPiece, error: fetchError } = await supabase
      .from("user_pieces")
      .select("id, user_id, stage")
      .eq("id", userPieceId)
      .eq("user_id", user.id)
      .single()

    if (fetchError) {
      throw new Error(fetchError.message)
    }

    const newStage = getNextStageForShaky(userPiece.stage)
    const nextReviewDue = getNextReviewDateFromStage(newStage)

    const { error: updateError } = await supabase
      .from("user_pieces")
      .update({
        stage: newStage,
        next_review_due: nextReviewDue,
        status: "learning",
      })
      .eq("id", userPieceId)
      .eq("user_id", user.id)

    if (updateError) {
      throw new Error(updateError.message)
    }

    const { error: reviewEventError } = await supabase
      .from("review_events")
      .insert({
        user_piece_id: userPieceId,
        outcome: "shaky",
        resulting_stage: newStage,
      })

    if (reviewEventError) {
      throw new Error(reviewEventError.message)
    }

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

  const { data: userPieces } = await supabase
    .from("user_pieces")
    .select("id, piece_id, status, next_review_due, stage")
    .eq("user_id", user.id)

  const dueToday =
    userPieces?.filter((userPiece: UserPiece) =>
      isDueToday(userPiece.next_review_due)
    ) ?? []

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