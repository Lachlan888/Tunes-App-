import { requireModerator } from "@/lib/auth/roles"

type ProfileSummary = {
  id: string
  username: string | null
  display_name: string | null
}

type PieceSummary = {
  id: number
  title: string
}

type PieceEditRequestRow = {
  id: number
  piece_id: number
  requested_by: string
  status: "pending" | "approved" | "rejected"
  proposed_changes: Record<string, unknown>
  reason: string | null
  moderator_comment: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}

type CommentReportRow = {
  id: number
  comment_id: number
  reported_by: string
  reason: string
  details: string | null
  status: "pending" | "dismissed" | "actioned"
  reviewed_by: string | null
  moderator_note: string | null
  created_at: string
  reviewed_at: string | null
}

type LoreReportRow = {
  id: number
  lore_entry_id: number
  reported_by: string
  reason: string
  details: string | null
  status: "pending" | "dismissed" | "actioned"
  reviewed_by: string | null
  moderator_note: string | null
  created_at: string
  reviewed_at: string | null
}

type PieceCommentRow = {
  id: number
  piece_id: number
  user_id: string
  body: string
  created_at: string
  parent_comment_id: number | null
  moderation_status: "visible" | "hidden"
}

type PieceLoreEntryRow = {
  id: number
  piece_id: number
  user_id: string
  category: string
  entry_text: string
  created_at: string
}

export type ModeratorPieceEditRequestItem = PieceEditRequestRow & {
  pieceTitle: string
  requesterName: string
  requesterUsername: string | null
}

export type ModeratorCommentReportItem = CommentReportRow & {
  commentBody: string
  commentAuthorName: string
  commentAuthorUsername: string | null
  reporterName: string
  reporterUsername: string | null
  pieceId: number
  pieceTitle: string
}

export type ModeratorLoreReportItem = LoreReportRow & {
  loreEntryText: string
  loreCategory: string
  loreAuthorName: string
  loreAuthorUsername: string | null
  reporterName: string
  reporterUsername: string | null
  pieceId: number
  pieceTitle: string
}

function getProfileName(profile: ProfileSummary | undefined) {
  if (!profile) return "Unknown player"
  return profile.display_name || profile.username || "Unknown player"
}

export async function loadModerationData() {
  const { supabase } = await requireModerator()

  const [editRequestsResult, commentReportsResult, loreReportsResult] =
    await Promise.all([
      supabase
        .from("piece_edit_requests")
        .select(
          "id, piece_id, requested_by, status, proposed_changes, reason, moderator_comment, reviewed_by, reviewed_at, created_at"
        )
        .eq("status", "pending")
        .order("created_at", { ascending: true }),
      supabase
        .from("comment_reports")
        .select(
          "id, comment_id, reported_by, reason, details, status, reviewed_by, moderator_note, created_at, reviewed_at"
        )
        .eq("status", "pending")
        .order("created_at", { ascending: true }),
      supabase
        .from("piece_lore_reports")
        .select(
          "id, lore_entry_id, reported_by, reason, details, status, reviewed_by, moderator_note, created_at, reviewed_at"
        )
        .eq("status", "pending")
        .order("created_at", { ascending: true }),
    ])

  if (editRequestsResult.error) {
    throw new Error(editRequestsResult.error.message)
  }

  if (commentReportsResult.error) {
    throw new Error(commentReportsResult.error.message)
  }

  if (loreReportsResult.error) {
    throw new Error(loreReportsResult.error.message)
  }

  const editRequests =
    (editRequestsResult.data as PieceEditRequestRow[] | null) ?? []
  const commentReports =
    (commentReportsResult.data as CommentReportRow[] | null) ?? []
  const loreReports = (loreReportsResult.data as LoreReportRow[] | null) ?? []

  const editPieceIds = editRequests.map((request) => request.piece_id)
  const requesterIds = editRequests.map((request) => request.requested_by)

  const commentIds = commentReports.map((report) => report.comment_id)
  const commentReporterIds = commentReports.map((report) => report.reported_by)

  const loreEntryIds = loreReports.map((report) => report.lore_entry_id)
  const loreReporterIds = loreReports.map((report) => report.reported_by)

  const { data: comments } =
    commentIds.length > 0
      ? await supabase
          .from("piece_comments")
          .select(
            "id, piece_id, user_id, body, created_at, parent_comment_id, moderation_status"
          )
          .in("id", commentIds)
      : { data: [] }

  const { data: loreEntries } =
    loreEntryIds.length > 0
      ? await supabase
          .from("piece_lore_entries")
          .select("id, piece_id, user_id, category, entry_text, created_at")
          .in("id", loreEntryIds)
      : { data: [] }

  const typedComments = (comments as PieceCommentRow[] | null) ?? []
  const typedLoreEntries = (loreEntries as PieceLoreEntryRow[] | null) ?? []

  const commentPieceIds = typedComments.map((comment) => comment.piece_id)
  const commentAuthorIds = typedComments.map((comment) => comment.user_id)

  const lorePieceIds = typedLoreEntries.map((entry) => entry.piece_id)
  const loreAuthorIds = typedLoreEntries.map((entry) => entry.user_id)

  const allPieceIds = Array.from(
    new Set([...editPieceIds, ...commentPieceIds, ...lorePieceIds])
  )

  const allProfileIds = Array.from(
    new Set([
      ...requesterIds,
      ...commentReporterIds,
      ...commentAuthorIds,
      ...loreReporterIds,
      ...loreAuthorIds,
    ])
  )

  const { data: pieces } =
    allPieceIds.length > 0
      ? await supabase.from("pieces").select("id, title").in("id", allPieceIds)
      : { data: [] }

  const { data: profiles } =
    allProfileIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, username, display_name")
          .in("id", allProfileIds)
      : { data: [] }

  const pieceMap = Object.fromEntries(
    ((pieces as PieceSummary[] | null) ?? []).map((piece) => [piece.id, piece])
  )

  const profileMap = Object.fromEntries(
    ((profiles as ProfileSummary[] | null) ?? []).map((profile) => [
      profile.id,
      profile,
    ])
  )

  const commentMap = Object.fromEntries(
    typedComments.map((comment) => [comment.id, comment])
  )

  const loreEntryMap = Object.fromEntries(
    typedLoreEntries.map((entry) => [entry.id, entry])
  )

  const pendingEditRequests: ModeratorPieceEditRequestItem[] =
    editRequests.map((request) => {
      const piece = pieceMap[request.piece_id]
      const requester = profileMap[request.requested_by]

      return {
        ...request,
        pieceTitle: piece?.title ?? `Tune ${request.piece_id}`,
        requesterName: getProfileName(requester),
        requesterUsername: requester?.username ?? null,
      }
    })

  const pendingCommentReports: ModeratorCommentReportItem[] =
    commentReports.map((report) => {
      const comment = commentMap[report.comment_id]
      const piece = comment ? pieceMap[comment.piece_id] : undefined
      const reporter = profileMap[report.reported_by]
      const commentAuthor = comment ? profileMap[comment.user_id] : undefined

      return {
        ...report,
        commentBody: comment?.body ?? "[Comment not found]",
        commentAuthorName: getProfileName(commentAuthor),
        commentAuthorUsername: commentAuthor?.username ?? null,
        reporterName: getProfileName(reporter),
        reporterUsername: reporter?.username ?? null,
        pieceId: comment?.piece_id ?? 0,
        pieceTitle: piece?.title ?? "Unknown tune",
      }
    })

  const pendingLoreReports: ModeratorLoreReportItem[] = loreReports.map(
    (report) => {
      const loreEntry = loreEntryMap[report.lore_entry_id]
      const piece = loreEntry ? pieceMap[loreEntry.piece_id] : undefined
      const reporter = profileMap[report.reported_by]
      const loreAuthor = loreEntry ? profileMap[loreEntry.user_id] : undefined

      return {
        ...report,
        loreEntryText: loreEntry?.entry_text ?? "[Lore entry not found]",
        loreCategory: loreEntry?.category ?? "unknown",
        loreAuthorName: getProfileName(loreAuthor),
        loreAuthorUsername: loreAuthor?.username ?? null,
        reporterName: getProfileName(reporter),
        reporterUsername: reporter?.username ?? null,
        pieceId: loreEntry?.piece_id ?? 0,
        pieceTitle: piece?.title ?? "Unknown tune",
      }
    }
  )

  return {
    pendingEditRequests,
    pendingCommentReports,
    pendingLoreReports,
  }
}
