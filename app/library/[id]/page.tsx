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

type UserPieceMetadata = {
  notes: string | null
}

type PieceSheetMusicLink = {
  id: number
  url: string
  label: string | null
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
        <p className="text-gray-600">No tune exists at id {pieceId}.</p>
        <div className="mt-4">
          <Link href="/library" className="underline">
            Back to Tunes
          </Link>
        </div>
      </main>
    )
  }

  const { data: userPieceMetadata } = await supabase
    .from("user_piece_metadata")
    .select("notes")
    .eq("user_id", user.id)
    .eq("piece_id", pieceId)
    .maybeSingle()

  const { data: sheetMusicLinks } = await supabase
    .from("piece_sheet_music_links")
    .select("id, url, label")
    .eq("piece_id", pieceId)
    .order("created_at", { ascending: true })

  const typedPiece = piece as Piece
  const typedUserPieceMetadata =
    (userPieceMetadata as UserPieceMetadata | null) ?? null
  const typedSheetMusicLinks =
    (sheetMusicLinks as PieceSheetMusicLink[] | null) ?? []

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

      <section className="mt-8">
        <h2 className="mb-2 text-xl font-semibold">My notes</h2>
        <p className="text-gray-700">
          {typedUserPieceMetadata?.notes || "No notes yet."}
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-2 text-xl font-semibold">Sheet music / tab</h2>
        {typedSheetMusicLinks.length > 0 ? (
          <ul className="space-y-2">
            {typedSheetMusicLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  {link.label || link.url}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-700">No sheet music links yet.</p>
        )}
      </section>
    </main>
  )
}