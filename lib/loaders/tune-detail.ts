import { redirect } from "next/navigation"
import { getCurrentUserRole } from "@/lib/auth/roles"
import { loadPagePreferences } from "@/lib/loaders/page-preferences"
import type { PracticeNoteCategory } from "@/lib/loaders/practice-diary"
import { TUNE_DETAIL_PAGE_OPTIONS_CONFIG } from "@/lib/page-options/configs"
import type { PageOptionsPreferences } from "@/lib/page-options/types"
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

export type UserPieceMediaLoop = {
  id: number
  piece_id: number
  youtube_video_id: string
  label: string
  start_seconds: number
  end_seconds: number
  playback_rate: number
  notes: string | null
  created_at: string
  updated_at: string
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

type ProfileRow = {
  id: string
  username: string | null
  display_name: string | null
}

type PracticeProfileRow = {
  practice_diary_enabled: boolean | null
}

export type CommentAuthor = {
  displayName: string
  username: string | null
}

export type LearningListItemRow = {
  learning_list_id: number
  piece_id: number
}

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
  practice_events:
    | {
        practice_outcome: string | null
      }
    | {
        practice_outcome: string | null
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
      typedMediaLoops: UserPieceMediaLoop[]
      typedPieceComments: PieceCommentRow[]
      typedPieceLoreEntries: PieceLoreEntryRow[]
      typedUserPiece: UserPiece | null
      typedUserKnownPiece: UserKnownPiece | null
      typedLearningLists: LearningList[]
      typedLearningListItems: LearningListItemRow[]
      typedPracticeNotes: TunePracticeNote[]
      typedTunePagePreferences: PageOptionsPreferences
      practiceDiaryEnabled: boolean
      practiceNoteCategories: PracticeNoteCategory[]
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

function getSingleJoinedRow<T>(value: T | T[] | null): T | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

function mapPracticeOutcomeLabel(outcome: string | null) {
  if (outcome === "rough") return "rough"
  if (outcome === "shaky") return "shaky"
  if (outcome === "solid") return "solid"
  if (outcome === "failed") return "failed"

  return outcome
}

function mapPracticeNote(row: PracticeNoteRow): TunePracticeNote {
  const practiceDay = getSingleJoinedRow(row.practice_days)
  const category = getSingleJoinedRow(row.practice_note_categories)
  const reviewEvent = getSingleJoinedRow(row.review_events)
  const practiceEvent = getSingleJoinedRow(row.practice_events)

  return {
    id: row.id,
    body: row.body,
    created_at: row.created_at,
    practice_date: practiceDay?.practice_date ?? row.created_at.slice(0, 10),
    category_name: category?.name ?? null,
    outcome: mapPracticeOutcomeLabel(
      reviewEvent?.outcome ?? practiceEvent?.practice_outcome ?? null
    ),
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
    mediaLoopsResult,
    pieceCommentsResult,
    pieceLoreEntriesResult,
    userPieceResult,
    userKnownPieceResult,
    learningListsResult,
    learningListItemsResult,
    practiceNotesResult,
    practiceProfileResult,
    practiceCategoriesResult,
    styleRowsResult,
    typedTunePagePreferences,
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
      .from("user_piece_media_loops")
      .select(
        "id, piece_id, youtube_video_id, label, start_seconds, end_seconds, playback_rate, notes, created_at, updated_at"
      )
      .eq("user_id", user.id)
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
          ),
          practice_events (
            practice_outcome
          )
        `
      )
      .eq("user_id", user.id)
      .eq("piece_id", pieceId)
      .order("created_at", { ascending: false })
      .limit(12),

    supabase
      .from("profiles")
      .select("practice_diary_enabled")
      .eq("id", user.id)
      .maybeSingle(),

    supabase
      .from("practice_note_categories")
      .select(
        `
          id,
          user_id,
          name,
          prompt,
          applies_to_tune_notes,
          applies_to_daily_reflection,
          sort_order,
          is_active,
          created_at,
          updated_at
        `
      )
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),

    supabase
      .from("styles")
      .select("id, slug, label")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),

    loadPagePreferences(TUNE_DETAIL_PAGE_OPTIONS_CONFIG.pageKey),
  ])

  const typedPiece = piece as Piece
  const typedUserPieceMetadata =
    (userPieceMetadataResult.data as UserPieceMetadata | null) ?? null
  const typedSheetMusicLinks =
    (sheetMusicLinksResult.data as PieceSheetMusicLink[] | null) ?? []
  const typedMediaLinks =
    (mediaLinksResult.data as PieceMediaLink[] | null) ?? []
  const typedMediaLoops =
    (mediaLoopsResult.data as UserPieceMediaLoop[] | null) ?? []
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
  const practiceDiaryEnabled = Boolean(
    (practiceProfileResult.data as PracticeProfileRow | null)
      ?.practice_diary_enabled
  )
  const practiceNoteCategories =
    (practiceCategoriesResult.data as PracticeNoteCategory[] | null) ?? []
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
    typedMediaLoops,
    typedPieceComments,
    typedPieceLoreEntries,
    typedUserPiece,
    typedUserKnownPiece,
    typedLearningLists,
    typedLearningListItems,
    typedPracticeNotes,
    typedTunePagePreferences,
    practiceDiaryEnabled,
    practiceNoteCategories,
    styleOptions,
    profileMap,
  }
}