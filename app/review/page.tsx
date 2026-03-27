import { createClient } from "@/lib/supabase/server"
import { markFailed, markShaky, markSolid } from "@/lib/actions/reviews"
import { getToday, isDueToday } from "@/lib/review"
import { redirect } from "next/navigation"

type Piece = {
  id: number
  title: string
  key: string | null
  style: string | null
  time_signature: string | null
}

type DuePiece = {
  id: number
  piece_id: number
  status: string
  next_review_due: string | null
  stage: number
  pieces: Piece[] | Piece | null
}

function getDateOnly(dateValue: string | null) {
  if (!dateValue) return null
  return dateValue.slice(0, 10)
}

function getPiece(pieces: Piece[] | Piece | null): Piece | null {
  if (!pieces) return null
  return Array.isArray(pieces) ? pieces[0] ?? null : pieces
}

export default async function ReviewPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: learningPieces, error } = await supabase
    .from("user_pieces")
    .select(`
      id,
      piece_id,
      status,
      next_review_due,
      stage,
      pieces (
        id,
        title,
        key,
        style,
        time_signature
      )
    `)
    .eq("user_id", user.id)
    .eq("status", "learning")
    .not("next_review_due", "is", null)
    .order("next_review_due", { ascending: true })

  if (error) {
    return (
      <main className="p-8">
        <h1 className="text-3xl font-bold">Practice</h1>
        <p className="mt-4 text-red-600">Could not load due tunes.</p>
      </main>
    )
  }

  const typedLearningPieces = (learningPieces ?? []) as DuePiece[]
  const duePieces = typedLearningPieces.filter((userPiece) =>
    isDueToday(userPiece.next_review_due)
  )

  if (duePieces.length === 0) {
    return (
      <main className="p-8">
        <h1 className="text-3xl font-bold">Practice</h1>
        <p className="mt-4 text-gray-600">No tunes due today.</p>
      </main>
    )
  }

  const today = getToday()

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Practice</h1>

      <p className="mt-4 text-sm text-gray-600">
        {duePieces.length} tune{duePieces.length === 1 ? "" : "s"} due
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {duePieces.map((userPiece) => {
          const piece = getPiece(userPiece.pieces)
          const dueDateOnly = getDateOnly(userPiece.next_review_due)
          const dueStatus =
            dueDateOnly && dueDateOnly < today ? "Overdue" : "Due today"

          return (
            <div key={userPiece.id} className="rounded-lg border p-6">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-2xl font-semibold">
                  {piece?.title ?? "Untitled piece"}
                </h2>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    dueStatus === "Overdue"
                      ? "bg-red-100 text-red-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {dueStatus}
                </span>
              </div>

              <p className="mt-2 text-sm text-gray-600">
                Key: {piece?.key ?? "Unknown"} | Style: {piece?.style ?? "Unknown"} | Time:{" "}
                {piece?.time_signature ?? "Unknown"}
              </p>

              <p className="mt-2 text-sm text-gray-600">
                Due:{" "}
                {userPiece.next_review_due
                  ? new Date(userPiece.next_review_due).toLocaleDateString("en-AU", {
                      timeZone: "Australia/Melbourne",
                    })
                  : "No due date"}{" "}
                | Stage: {userPiece.stage}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <form action={markFailed}>
                  <input type="hidden" name="userPieceId" value={userPiece.id} />
                  <button
                    type="submit"
                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                  >
                    Failed
                  </button>
                </form>

                <form action={markShaky}>
                  <input type="hidden" name="userPieceId" value={userPiece.id} />
                  <button
                    type="submit"
                    className="rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600"
                  >
                    Shaky
                  </button>
                </form>

                <form action={markSolid}>
                  <input type="hidden" name="userPieceId" value={userPiece.id} />
                  <button
                    type="submit"
                    className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                  >
                    Solid
                  </button>
                </form>
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}