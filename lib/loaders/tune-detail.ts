import { redirect } from "next/navigation"
import { getCurrentUserRole } from "@/lib/auth/roles"
import { createClient } from "@/lib/supabase/server"
import type {
  LearningList,
  Piece,
  StyleOption,
  UserKnownPiece,
  UserPiece,
  UserRole,
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
  parent_comment_id: number | null
  moderation_status: "visible" | "hidden"
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

export type TunePracticeNote = {
  id: number
  body: string
  created_at: string
  practice_date: string
  category_name: string | null
  outcome: string | null
}

export type TunePagePreferences = {
  show_tune_state: boolean
  show_canonical_details: boolean
  show_my_notes: boolean
  show_practice_history: boolean
  show_media_links: boolean
  show_sheet_music: boolean
  show_lore: boolean
  show_comments: boolean
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

type TunePagePreferencesRow = TunePagePreferences

type PracticeNoteRow = {
  id: number
  body: string
  created_at: string
  practice_days:
    | {
        practice_date: string
      }
    | {
        practice_date: string
      }[]
    | null
  practice_note_categories:
    | {
        name: string
      }
    | {
        name: string
      }[]
    | null
  review_events:
    | {
        outcome: string
      }
    | {
        outcome: string
      }[]
    | null
}

export type TuneDetailLoadResult =
  | {
      status: "loaded"
      user: {
        id: string
        email?: string | null
      }
      currentUserRole: UserRole
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
      typedPracticeNotes: TunePracticeNote[]
      typedTunePagePreferences: TunePagePreferences
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

const DEFAULT_TUNE_PAGE_PREFERENCES: TunePagePreferences = {
  show_tune_state: true,
  show_canonical_details: true,
  show_my_notes: true,
  show_practice_history: true,
  show_media_links: true,
  show_sheet_music: true,
  show_lore: true,
  show_comments: true,
}

function getSingleJoinedRow<T>(value: T | T[] | null): T | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

function mapPracticeNote(row: PracticeNoteRow): TunePracticeNote {
  const practiceDay = getSingleJoinedRow(row.practice_days)
  const category = getSingleJoinedRow(row.practice_note_categories)
  const reviewEvent = getSingleJoinedRow(row.review_events)

  return {
    id: row.id,
    body: row.body,
    created_at: row.created_at,
    practice_date: practiceDay?.practice_date ?? row.created_at.slice(0, 10),
    category_name: category?.name ?? null,
    outcome: reviewEvent?.outcome ?? null,
  }
}

function normaliseTunePagePreferences(
  preferences: TunePagePreferencesRow | null
): TunePagePreferences {
  if (!preferences) {
    return DEFAULT_TUNE_PAGE_PREFERENCES
  }

  return {
    ...DEFAULT_TUNE_PAGE_PREFERENCES,
    ...preferences,
  }
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

  const currentUserRole = await getCurrentUserRole(supabase, user.id)
  const canSeeHiddenComments =
    currentUserRole === "moderator" || currentUserRole === "admin"

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

  let commentsQuery = supabase
    .from("piece_comments")
    .select(
      "id, body, created_at, user_id, parent_comment_id, moderation_status"
    )
    .eq("piece_id", pieceId)
    .order("created_at", { ascending: true })

  if (!canSeeHiddenComments) {
    commentsQuery = commentsQuery.eq("moderation_status", "visible")
  }

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
    practiceNotesResult,
    tunePagePreferencesResult,
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
    commentsQuery,
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
      .from("practice_notes")
      .select(
        `
          id,
          body,
          created_at,
          practice_days (
            practice_date
          ),
          practice_note_categories (
            name
          ),
          review_events (
            outcome
          )
        `
      )
      .eq("user_id", user.id)
      .eq("piece_id", pieceId)
      .order("created_at", { ascending: false })
      .limit(12),
    supabase
      .from("user_tune_page_preferences")
      .select(
        `
          show_tune_state,
          show_canonical_details,
          show_my_notes,
          show_practice_history,
          show_media_links,
          show_sheet_music,
          show_lore,
          show_comments
        `
      )
      .eq("user_id", user.id)
      .maybeSingle(),
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
  const typedPracticeNotes = ((practiceNotesResult.data ??
    []) as PracticeNoteRow[]).map(mapPracticeNote)
  const typedTunePagePreferences = normaliseTunePagePreferences(
    (tunePagePreferencesResult.data as TunePagePreferencesRow | null) ?? null
  )
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
    currentUserRole,
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
    typedPracticeNotes,
    typedTunePagePreferences,
    styleOptions,
    profileMap,
  }
}