import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

type PiecePageProps = {
  params: Promise<{
    id: string
  }>
}

type Piece = {
  id: number
  title: string
  key: string | null
  style: string | null
  time_signature: string | null
  reference_url: string | null
}

export default async function PiecePage({ params }: PiecePageProps) {
  const { id } = await params
  const pieceId = Number(id)

  if (!Number.isInteger(pieceId) || pieceId <= 0) {
    redirect("/library")
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: piece, error } = await supabase
    .from("pieces")
    .select("id, title, key, style, time_signature, reference_url")
    .eq("id", pieceId)
    .maybeSingle()

  if (error) {
    return (
      <main className="p-8">
        <h1 className="mb-4 text-3xl font-bold">Tune</h1>
        <p className="text-red-600">Could not load tune.</p>
        <div className="mt-4">
          <Link href="/library" className="underline">
            Back to Tunes
          </Link>
        </div>
      </main>
    )
  }

  if (!piece) {
    return (
      <main className="p-8">
        <h1 className="mb-4 text-3xl font-bold">Tune not found</h1>
        <p className="text-gray-600">
          No tune exists at id {pieceId}.
        </p>
        <div className="mt-4">
          <Link href="/library" className="underline">
            Back to Tunes
          </Link>
        </div>
      </main>
    )
  }

  const typedPiece = piece as Piece

  return (
    <main className="p-8">
      <div className="mb-6">
        <Link href="/library" className="text-sm underline">
          Back to Tunes
        </Link>
      </div>

      <h1 className="mb-4 text-3xl font-bold">{typedPiece.title}</h1>

      <div className="space-y-2 text-gray-700">
        <p>Key: {typedPiece.key || "—"}</p>
        <p>Style: {typedPiece.style || "—"}</p>
        <p>Time signature: {typedPiece.time_signature || "—"}</p>
        <p>
          Reference:{" "}
          {typedPiece.reference_url ? (
            <a
              href={typedPiece.reference_url}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Open reference
            </a>
          ) : (
            "—"
          )}
        </p>
      </div>
    </main>
  )
}