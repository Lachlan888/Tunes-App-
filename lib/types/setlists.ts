import type { Piece } from "./pieces"

export type Setlist = {
  id: number
  name: string
  description: string | null
  event_date: string | null
  location: string | null
  created_by: string
  created_at: string
  updated_at: string | null
}

export type SetlistMemberProfile = {
  id: string
  username: string | null
  display_name: string | null
}

export type SetlistMember = {
  id: number
  setlist_id: number
  user_id: string
  status: "pending" | "accepted" | "declined"
  invited_by: string | null
  created_at: string
  responded_at: string | null
  profile: SetlistMemberProfile | null
}

export type SetlistMemberCoverage = {
  user_id: string
  status: "known" | "practice" | "gap"
  stage: number | null
  user_piece_id: number | null
}

export type SetlistItemWithCoverage = {
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
  piece: Piece | null
  coverage: SetlistMemberCoverage[]
}

export type SetlistOverview = {
  id: number
  name: string
  description: string | null
  event_date: string | null
  location: string | null
  created_by: string
  memberCount: number
  tuneCount: number
  knownByEveryoneCount: number
  gapTuneCount: number
  isCreator: boolean
}

export type SetlistPendingInvite = {
  membership_id: number
  setlist: Setlist
  invited_by_profile: SetlistMemberProfile | null
}

export type SetlistInviteOption = {
  user_id: string
  username: string | null
  display_name: string | null
}