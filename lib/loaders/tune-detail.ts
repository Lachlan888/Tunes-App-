import { redirect } from "next/navigation"
import { requireUserContext } from "@/lib/auth/session"
import { withServerTiming } from "@/lib/server-timing"
import type { TuneDetailView } from "@/lib/tune-detail-view"
import {
  loadComposerProfile,
  loadComposerProfileOptions,
  loadStyleOptions,
  loadTuneCore,
} from "./tune-detail/core"
import { loadTuneCommunity } from "./tune-detail/community"
import { loadProfileMapForCommunityRows } from "./tune-detail/helpers"
import { loadTuneLinks } from "./tune-detail/links"
import { loadTunePracticeHistory } from "./tune-detail/practice-history"
import { loadTuneUserState } from "./tune-detail/user-state"
import { buildTuneMediaBundle } from "@/lib/tune-media"

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
  PublicTuneListSummary,
  TuneDetailLoadedData,
  TuneDetailLoadResult,
  TunePracticeNote,
  TuneReviewSummary,
  UserPieceMediaLoop,
  UserPieceMetadata,
} from "./tune-detail/types"

import type { TuneDetailLoadResult } from "./tune-detail/types"

export type TuneDetailLoadScope = TuneDetailView

export async function loadTuneDetailData(
  rawPieceId: string,
  scope: TuneDetailLoadScope = "practice"
): Promise<TuneDetailLoadResult> {
  const pieceId = Number(rawPieceId)

  if (!Number.isInteger(pieceId) || pieceId <= 0) {
    redirect("/library")
  }

  const { supabase, user, role: currentUserRole } =
    await requireUserContext()

  const needsComments = scope === "about"
  const needsPracticeHistory = scope === "practice"

  const [
    coreResult,
    userState,
    tuneLinks,
    tuneCommunity,
    tunePracticeHistory,
    styleOptions,
    composerProfileOptions,
  ] = await withServerTiming(`tune-detail.${scope}.primary-data`, () =>
    Promise.all([
      loadTuneCore(supabase, pieceId),
      loadTuneUserState(supabase, user.id, pieceId, scope),
      loadTuneLinks(supabase, user.id, pieceId),
      loadTuneCommunity(
        supabase,
        pieceId,
        currentUserRole,
        needsComments
      ),
      needsPracticeHistory
        ? loadTunePracticeHistory(supabase, user.id, pieceId)
        : Promise.resolve({
            typedPracticeNotes: [],
            typedReviewHistory: [],
            practiceNoteCategories: [],
          }),
      loadStyleOptions(supabase),
      loadComposerProfileOptions(supabase),
    ])
  )

  const { piece, loadError } = coreResult

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

  const [composerProfile, profileMap] = await withServerTiming(
    `tune-detail.${scope}.secondary-data`,
    () =>
      Promise.all([
        loadComposerProfile(supabase, piece.composer_user_id),
        needsComments
          ? loadProfileMapForCommunityRows(
              supabase,
              tuneCommunity.typedPieceComments,
              tuneCommunity.typedPieceLoreEntries
            )
          : Promise.resolve({}),
      ])
  )

  const redirectTo = `/library/${pieceId}`
  const tuneMediaBundle = buildTuneMediaBundle({
    piece,
    mediaLinks: tuneLinks.typedMediaLinks,
    sheetMusicLinks: tuneLinks.typedSheetMusicLinks.map((link) => ({
      ...link,
      piece_id: pieceId,
    })),
    metadata: userState.typedUserPieceMetadata
      ? {
          piece_id: pieceId,
          preferred_reference_url:
            userState.typedUserPieceMetadata.preferred_reference_url,
          preferred_reference_label:
            userState.typedUserPieceMetadata.preferred_reference_label,
        }
      : null,
    mediaLoops: tuneLinks.typedMediaLoops,
  })

  return {
    status: "loaded",
    user,
    currentUserRole,
    pieceId,
    redirectTo,
    typedPiece: piece,
    typedUserPieceMetadata: userState.typedUserPieceMetadata,
    typedMediaLinks: tuneLinks.typedMediaLinks,
    typedSheetMusicLinks: tuneLinks.typedSheetMusicLinks,
    typedMediaLoops: tuneLinks.typedMediaLoops,
    tuneMediaBundle,
    typedPieceComments: tuneCommunity.typedPieceComments,
    typedPieceLoreEntries: tuneCommunity.typedPieceLoreEntries,
    typedUserPiece: userState.typedUserPiece,
    typedUserKnownPiece: userState.typedUserKnownPiece,
    typedLearningLists: userState.typedLearningLists,
    typedLearningListItems: userState.typedLearningListItems,
    typedPublicTuneLists: userState.typedPublicTuneLists,
    typedPracticeNotes: tunePracticeHistory.typedPracticeNotes,
    typedReviewHistory: tunePracticeHistory.typedReviewHistory,
    practiceDiaryEnabled: userState.practiceDiaryEnabled,
    practiceNoteCategories: tunePracticeHistory.practiceNoteCategories,
    styleOptions,
    composerProfile,
    composerProfileOptions,
    profileMap,
  }
}
