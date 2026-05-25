export type PieceStyleTag = {
  style_id: number
  styles:
    | {
        id: number
        slug: string
        label: string
      }
    | {
        id: number
        slug: string
        label: string
      }[]
    | null
}

export type Piece = {
  id: number
  title: string
  key: string | null
  style: string | null
  time_signature: string | null
  composer?: string | null
  reference_url?: string | null
  created_at?: string | null
  piece_styles?: PieceStyleTag[] | null
}

export type PieceFilterOption = {
  key: string | null
  style: string | null
  time_signature: string | null
  piece_styles?: PieceStyleTag[] | null
}

export type StyleOption = {
  id: number
  slug: string
  label: string
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
