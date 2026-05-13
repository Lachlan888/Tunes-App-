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
  reference_url?: string | null
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