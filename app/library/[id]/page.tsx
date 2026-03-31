import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import {
  addPieceSheetMusicLink,
  upsertUserPieceNotes,
} from "@/lib/actions/piece-metadata"
import PieceCommentsSection from "@/components/PieceCommentsSection"

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

type PieceCommentRow = {
  id: number
  body: string
  created_at: string
  user_id: string
}

type ProfileRow = {
  id: string
  username: string | null
  display_name: string | null
}

type CommentAuthor = {
  displayName: string
  username: string | null
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

  const { data: pieceComments } = await supabase
    .from("piece_comments")
    .select("id, body, created_at, user_id")
    .eq("piece_id", pieceId)
    .order("created_at", { ascending: false })

  const typedPiece = piece as Piece
  const typedUserPieceMetadata =
    (userPieceMetadata as UserPieceMetadata | null) ?? null
  const typedSheetMusicLinks =
    (sheetMusicLinks as PieceSheetMusicLink[] | null) ?? []
  const typedPieceComments =
    (pieceComments as PieceCommentRow[] | null) ?? []

  const commentUserIds = Array.from(
    new Set(typedPieceComments.map((comment) => comment.user_id))
  )

  let profileMap: Record<string, CommentAuthor> = {}

  if (commentUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, display_name")
      .in("id", commentUserIds)

    const typedProfiles = (profiles as ProfileRow[] | null) ?? []

    profileMap = Object.fromEntries(
      typedProfiles.map((profile) => [
        profile.id,
        {
          displayName: profile.display_name || profile.username || "Unknown user",
          username: profile.username,
        },
      ])
    )
  }

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

        <form action={upsertUserPieceNotes} className="max-w-xl">
          <input type="hidden" name="piece_id" value={pieceId} />
          <input type="hidden" name="redirect_to" value={`/library/${pieceId}`} />

          <textarea
            name="notes"
            defaultValue={typedUserPieceMetadata?.notes || ""}
            rows={8}
            placeholder="Add your private notes for this tune"
            className="mb-3 w-full border p-3"
          />

          <button type="submit" className="border px-4 py-2">
            Save notes
          </button>
        </form>
      </section>

      <section className="mt-8">
        <h2 className="mb-2 text-xl font-semibold">Sheet music / tab</h2>

        <form action={addPieceSheetMusicLink} className="mb-6 max-w-xl space-y-3">
          <input type="hidden" name="piece_id" value={pieceId} />
          <input type="hidden" name="redirect_to" value={`/library/${pieceId}`} />

          <input
            name="label"
            placeholder="Label, eg Mandolin tab"
            className="w-full border p-2"
            required
          />

          <input
            name="url"
            type="url"
            placeholder="https://..."
            className="w-full border p-2"
            required
          />

          <button type="submit" className="border px-4 py-2">
            Add sheet music link
          </button>
        </form>

        {typedSheetMusicLinks.length > 0 ? (
          <ul className="space-y-3">
            {typedSheetMusicLinks.map((link) => (
              <li key={link.id} className="border p-3">
                <p className="mb-1 text-sm text-gray-600">{link.label}</p>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all underline"
                >
                  {link.url}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-700">No sheet music links yet.</p>
        )}
      </section>

      <PieceCommentsSection
        pieceId={pieceId}
        comments={typedPieceComments}
        profileMap={profileMap}
      />
    </main>
  )
}