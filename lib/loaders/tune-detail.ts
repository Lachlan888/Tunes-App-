import { redirect } from "next/navigation"
import { getCurrentUserRole } from "@/lib/auth/roles"
import { loadPagePreferences } from "@/lib/loaders/page-preferences"
import { TUNE_DETAIL_PAGE_OPTIONS_CONFIG } from "@/lib/page-options/configs"
import { createClient } from "@/lib/supabase/server"
import { loadStyleOptions, loadTuneCore } from "./tune-detail/core"
import { loadTuneCommunity } from "./tune-detail/community"
import { loadProfileMapForCommunityRows } from "./tune-detail/helpers"
import { loadTuneLinks } from "./tune-detail/links"
import { loadTunePracticeHistory } from "./tune-detail/practice-history"
import { loadOwnedListIds, loadTuneUserState } from "./tune-detail/user-state"
export type {
  CommentAuthor,
  LearningListItemRow,
  PieceCommentRow,
  PieceLoreCategory,
  PieceLoreEntryRow,
  PieceMediaLink,
  PieceSheetMusicLink,
  PracticeNoteRow,
  PracticeProfileRow,
  ProfileRow,
  TuneDetailLoadedData,
  TuneDetailLoadResult,
  TunePracticeNote,
  UserPieceMediaLoop,
  UserPieceMetadata,
} from "./tune-detail/types"
import type { TuneDetailLoadResult } from "./tune-detail/types"

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

  const { piece, loadError } = await loadTuneCore(supabase, pieceId)

  if (loadError) {
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

  const ownedListIds = await loadOwnedListIds(supabase, user.id)

  const [
    userState,
    tuneLinks,
    tuneCommunity,
    tunePracticeHistory,
    styleOptions,
    typedTunePagePreferences,
  ] = await Promise.all([
    loadTuneUserState(supabase, user.id, pieceId, ownedListIds),
    loadTuneLinks(supabase, user.id, pieceId),
    loadTuneCommunity(supabase, pieceId, currentUserRole),
    loadTunePracticeHistory(supabase, user.id, pieceId),
    loadStyleOptions(supabase),
    loadPagePreferences(TUNE_DETAIL_PAGE_OPTIONS_CONFIG.pageKey),
  ])

  const profileMap = await loadProfileMapForCommunityRows(
    supabase,
    tuneCommunity.typedPieceComments,
    tuneCommunity.typedPieceLoreEntries
  )

  const redirectTo = `/library/${pieceId}`

  return {
    status: "loaded",
    user,
    currentUserRole,
    pieceId,
    redirectTo,
    typedPiece: piece,
    typedUserPieceMetadata: userState.typedUserPieceMetadata,
    typedSheetMusicLinks: tuneLinks.typedSheetMusicLinks,
    typedMediaLinks: tuneLinks.typedMediaLinks,
    typedMediaLoops: tuneLinks.typedMediaLoops,
    typedPieceComments: tuneCommunity.typedPieceComments,
    typedPieceLoreEntries: tuneCommunity.typedPieceLoreEntries,
    typedUserPiece: userState.typedUserPiece,
    typedUserKnownPiece: userState.typedUserKnownPiece,
    typedLearningLists: userState.typedLearningLists,
    typedLearningListItems: userState.typedLearningListItems,
    typedPracticeNotes: tunePracticeHistory.typedPracticeNotes,
    typedTunePagePreferences,
    practiceDiaryEnabled: userState.practiceDiaryEnabled,
    practiceNoteCategories: tunePracticeHistory.practiceNoteCategories,
    styleOptions,
    profileMap,
  }
}