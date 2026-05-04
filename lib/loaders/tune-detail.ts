import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type {
  LearningList,
  Piece,
  StyleOption,
  UserKnownPiece,
  UserPiece,
} from "@/lib/types"

export type UserPieceMetadata = {
  notes: string | null
}

export type PieceSheetMusicLink = {
  id: number
  url: string
  label: string | null
}

export type PieceMediaLink = {
  id: number
  url: string
  label: string | null
}

export type PieceCommentRow = {
  id: number
  body: string
  created_at: string
  user_id: string
}

export type PieceLoreCategory =
  | "region"
  | "informant"
  | "collector"
  | "alternate_title"
  | "tune_family"
  | "story_folklore_note"

export type PieceLoreEntryRow = {
  id: number
  category: PieceLoreCategory
  entry_text: string
  created_at: string
  user_id: string
}

type ProfileRow = {
  id: string
  username: string | null
  display_name: string | null
}

export type CommentAuthor = {
  displayName: string
  username: string | null
}

export type LearningListItemRow = {
  learning_list_id: number
  piece_id: number
}

export type TuneDetailLoadResult =
  | {
      status: "loaded"
      user: {
        id: string
        email?: string | null
      }
      pieceId: number
      redirectTo: string
      typedPiece: Piece
      typedUserPieceMetadata: UserPieceMetadata | null
      typedSheetMusicLinks: PieceSheetMusicLink[]
      typedMediaLinks: PieceMediaLink[]
      typedPieceComments: PieceCommentRow[]
      typedPieceLoreEntries: PieceLoreEntryRow[]
      typedUserPiece: UserPiece | null
      typedUserKnownPiece: UserKnownPiece | null
      typedLearningLists: LearningList[]
      typedLearningListItems: LearningListItemRow[]
      styleOptions: StyleOption[]
      profileMap: Record<string, CommentAuthor>
    }
  | {
      status: "load_error"
      pieceId: number
    }
  | {
      status: "not_found"
      pieceId: number
    }

export async function loadTuneDetailData(
  rawPieceId: string
): Promise<TuneDetailLoadResult> {
  const pieceId = Number(rawPieceId)

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
    return {
      status: "load_error",
      pieceId,
    }
  }

  if (!piece) {
    return {
      status: "not_found",
      pieceId,
    }
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
    pieceLoreEntriesResult,
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
      .from("piece_lore_entries")
      .select("id, category, entry_text, created_at, user_id")
      .eq("piece_id", pieceId)
      .order("category", { ascending: true })
      .order("created_at", { ascending: true }),
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
  const typedPieceLoreEntries =
    (pieceLoreEntriesResult.data as PieceLoreEntryRow[] | null) ?? []
  const typedUserPiece = (userPieceResult.data as UserPiece | null) ?? null
  const typedUserKnownPiece =
    (userKnownPieceResult.data as UserKnownPiece | null) ?? null
  const typedLearningLists =
    (learningListsResult.data as LearningList[] | null) ?? []
  const typedLearningListItems =
    (learningListItemsResult.data as LearningListItemRow[] | null) ?? []
  const styleOptions = (styleRowsResult.data as StyleOption[] | null) ?? []

  const profileUserIds = Array.from(
    new Set([
      ...typedPieceComments.map((comment) => comment.user_id),
      ...typedPieceLoreEntries.map((entry) => entry.user_id),
    ])
  )

  let profileMap: Record<string, CommentAuthor> = {}

  if (profileUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, display_name")
      .in("id", profileUserIds)

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

  const redirectTo = `/library/${pieceId}`

  return {
    status: "loaded",
    user,
    pieceId,
    redirectTo,
    typedPiece,
    typedUserPieceMetadata,
    typedSheetMusicLinks,
    typedMediaLinks,
    typedPieceComments,
    typedPieceLoreEntries,
    typedUserPiece,
    typedUserKnownPiece,
    typedLearningLists,
    typedLearningListItems,
    styleOptions,
    profileMap,
  }
}