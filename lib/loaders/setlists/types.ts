import type { Piece, Setlist } from "@/lib/types"

export type MembershipRow = {
  id: number
  setlist_id: number
  user_id: string
  status: "pending" | "accepted" | "declined"
  invited_by: string | null
  created_at: string
  responded_at: string | null
  setlists: Setlist | Setlist[] | null
}

export type SetlistMemberRow = {
  id: number
  setlist_id: number
  user_id: string
  status: "pending" | "accepted" | "declined"
  invited_by: string | null
  created_at: string
  responded_at: string | null
}

export type SetlistItemRow = {
  id: number
  setlist_id: number
  piece_id: number
  position: number
  performance_key: string | null
  notes: string | null
  chart_url: string | null
  chart_label: string | null
  chart_type: string | null
  added_by: string | null
  created_at: string
  updated_at: string | null
  pieces: Piece | Piece[] | null
}

export type UserPieceRow = {
  id: number
  user_id: string
  piece_id: number
  stage: number
}

export type UserKnownPieceRow = {
  user_id: string
  piece_id: number
}

export type ConnectionRow = {
  id: number
  status: "pending" | "accepted"
  requester_id: string
  addressee_id: string
}

export type SetlistSummary = {
  tuneCount: number
  memberCount: number
  knownByEveryoneCount: number
  gapTuneCount: number
}