import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import {
  addPieceMediaLink,
  addPieceSheetMusicLink,
  upsertUserPieceNotes,
} from "@/lib/actions/piece-metadata"
import { addToLearningList } from "@/lib/actions/lists"
import { startLearning } from "@/lib/actions/user-pieces"
import PieceCommentsSection from "@/components/PieceCommentsSection"
import PieceMediaLinksSection from "@/components/PieceMediaLinksSection"
import ReferenceMediaEmbed from "@/components/ReferenceMediaEmbed"
import SubmitButton from "@/components/SubmitButton"
import TuneCanonicalDetailsCard from "@/components/TuneCanonicalDetailsCard"
import TuneDetailActions from "@/components/TuneDetailActions"
import type { LearningList, Piece, UserKnownPiece, UserPiece } from "@/lib/types"

type PiecePageProps = {
  params: Promise<{
    id: string
  }>
}

type UserPieceMetadata = {
  notes: string | null
}

type PieceSheetMusicLink = {
  id: number
  url: string
  label: string | null
}

type PieceMediaLink = {
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

type LearningListItemRow = {
  learning_list_id: number
  piece_id: number
}

type StyleOption = {
  id: number
  slug: string
  label: string
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

  const { data: ownedLists } = await supabase
    .from("learning_lists")
    .select("id")
    .eq("user_id", user.id)

  const ownedListIds = (ownedLists ?? []).map((list) => list.id)

  const [
    userPieceMetadataResult,
    sheetMusicLinksResult,
    mediaLinksResult,
    pieceCommentsResult,
    userPieceResult,
    userKnownPieceResult,
    learningListsResult,
    learningListItemsResult,
    styleRowsResult,
  ] = await Promise.all([
    supabase
      .from("user_piece_metadata")
      .select("notes")
      .eq("user_id", user.id)
      .eq("piece_id", pieceId)
      .maybeSingle(),
    supabase
      .from("piece_sheet_music_links")
      .select("id, url, label")
      .eq("piece_id", pieceId)
      .order("created_at", { ascending: true }),
    supabase
      .from("piece_media_links")
      .select("id, url, label")
      .eq("piece_id", pieceId)
      .order("created_at", { ascending: true }),
    supabase
      .from("piece_comments")
      .select("id, body, created_at, user_id")
      .eq("piece_id", pieceId)
      .order("created_at", { ascending: false }),
    supabase
      .from("user_pieces")
      .select("id, piece_id, status, next_review_due, stage")
      .eq("user_id", user.id)
      .eq("piece_id", pieceId)
      .maybeSingle(),
    supabase
      .from("user_known_pieces")
      .select("id, piece_id")
      .eq("user_id", user.id)
      .eq("piece_id", pieceId)
      .maybeSingle(),
    supabase
      .from("learning_lists")
      .select("id, name, description")
      .eq("user_id", user.id)
      .order("name", { ascending: true }),
    ownedListIds.length > 0
      ? supabase
          .from("learning_list_items")
          .select("learning_list_id, piece_id")
          .eq("piece_id", pieceId)
          .in("learning_list_id", ownedListIds)
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("styles")
      .select("id, slug, label")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ])

  const typedPiece = piece as Piece
  const typedUserPieceMetadata =
    (userPieceMetadataResult.data as UserPieceMetadata | null) ?? null
  const typedSheetMusicLinks =
    (sheetMusicLinksResult.data as PieceSheetMusicLink[] | null) ?? []
  const typedMediaLinks =
    (mediaLinksResult.data as PieceMediaLink[] | null) ?? []
  const typedPieceComments =
    (pieceCommentsResult.data as PieceCommentRow[] | null) ?? []
  const typedUserPiece = (userPieceResult.data as UserPiece | null) ?? null
  const typedUserKnownPiece =
    (userKnownPieceResult.data as UserKnownPiece | null) ?? null
  const typedLearningLists =
    (learningListsResult.data as LearningList[] | null) ?? []
  const typedLearningListItems =
    (learningListItemsResult.data as LearningListItemRow[] | null) ?? []
  const styleOptions: StyleOption[] =
    (styleRowsResult.data as StyleOption[] | null) ?? []

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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-8">
          <section className="rounded border p-4">
            <h1 className="mb-4 text-3xl font-bold">{typedPiece.title}</h1>

            <div className="space-y-2 text-gray-700">
              <p>Key: {typedPiece.key || "—"}</p>
              <p>Style: {typedPiece.style || "—"}</p>
              <p>Time signature: {typedPiece.time_signature || "—"}</p>
              <p>
                Reference{" "}
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
          </section>

          {typedPiece.reference_url && (
            <ReferenceMediaEmbed
              referenceUrl={typedPiece.reference_url}
              title={typedPiece.title}
            />
          )}

          <TuneDetailActions
            piece={typedPiece}
            userPiece={typedUserPiece}
            userKnownPiece={typedUserKnownPiece}
            learningLists={typedLearningLists}
            learningListItems={typedLearningListItems}
            redirectTo={`/library/${pieceId}`}
            startLearning={startLearning}
            addToLearningList={addToLearningList}
          />

          <TuneCanonicalDetailsCard
            piece={typedPiece}
            redirectTo={`/library/${pieceId}`}
            styleOptions={styleOptions}
          />
        </div>

        <div className="space-y-8">
          <section className="rounded border p-4">
            <h2 className="mb-2 text-xl font-semibold">My notes</h2>

            <form action={upsertUserPieceNotes} className="space-y-3">
              <input type="hidden" name="piece_id" value={pieceId} />
              <input type="hidden" name="redirect_to" value={`/library/${pieceId}`} />

              <textarea
                name="notes"
                defaultValue={typedUserPieceMetadata?.notes || ""}
                rows={8}
                placeholder="Add your private notes for this tune"
                className="w-full border p-3"
              />

              <SubmitButton
                label="Save notes"
                pendingLabel="Saving..."
                className="border px-4 py-2"
              />
            </form>
          </section>

          <PieceMediaLinksSection
            pieceId={pieceId}
            redirectTo={`/library/${pieceId}`}
            mediaLinks={typedMediaLinks}
            addPieceMediaLink={addPieceMediaLink}
          />

          <section className="rounded border p-4">
            <h2 className="mb-2 text-xl font-semibold">Sheet music / tab</h2>

            <form action={addPieceSheetMusicLink} className="mb-6 space-y-3">
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

              <SubmitButton
                label="Add sheet music link"
                pendingLabel="Adding..."
                className="border px-4 py-2"
              />
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
        </div>
      </div>

      <section className="mt-8 rounded border p-4">
        <PieceCommentsSection
          pieceId={pieceId}
          comments={typedPieceComments}
          profileMap={profileMap}
        />
      </section>
    </main>
  )
}