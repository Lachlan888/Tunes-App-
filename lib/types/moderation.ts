export type PieceEditRequestStatus = "pending" | "approved" | "rejected"

export type PieceEditRequest = {
  id: number
  piece_id: number
  requested_by: string
  status: PieceEditRequestStatus
  proposed_changes: Record<string, unknown>
  reason: string | null
  moderator_comment: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}

export type CommentReportReason =
  | "spam"
  | "abuse_or_harassment"
  | "hateful_content"
  | "sexual_content"
  | "misleading_or_bad_faith"
  | "other"

export type CommentReportStatus = "pending" | "dismissed" | "actioned"

export type CommentReport = {
  id: number
  comment_id: number
  reported_by: string
  reason: CommentReportReason
  details: string | null
  status: CommentReportStatus
  reviewed_by: string | null
  moderator_note: string | null
  created_at: string
  reviewed_at: string | null
}