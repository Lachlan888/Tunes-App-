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

export type UserPiece = {
  id: number
  piece_id: number
  status: string
  next_review_due: string | null
  stage: number
}

export type UserKnownPiece = {
  id: number
  piece_id: number
}

export type LearningListVisibility = "private" | "public"
export type LearningListSource = "mine" | "imported"

export type LearningList = {
  id: number
  name: string
  description: string | null
  visibility?: LearningListVisibility
  is_imported?: boolean
}

export type LearningListItem = {
  id?: number
  piece_id?: number
  learning_list_id?: number
  position?: number | null
  pieces?: Piece | Piece[] | null
  learning_lists?: {
    id: number
    name: string
    user_id: string
  }
}

export type UserPieceWithPiece = {
  id: number
  piece_id: number
  stage: number
  pieces:
    | {
        id: number
        title: string
      }
    | {
        id: number
        title: string
      }[]
    | null
}

export type UserKnownPieceWithPiece = {
  id: number
  piece_id: number
  pieces:
    | {
        id: number
        title: string
      }
    | {
        id: number
        title: string
      }[]
    | null
}

export type MyTuneRow = {
  piece_id: number
  title: string
  inPractice: boolean
  known: boolean
}

export type FilterableLearningList = {
  id: number
  name: string
  description: string | null
  visibility: LearningListVisibility
  is_imported: boolean
  tunes: Piece[]
  tuneCount: number
  stylesPresent: string[]
  source: LearningListSource
}