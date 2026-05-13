import type { Piece } from "./pieces"

export type LearningListVisibility = "private" | "public"
export type LearningListSource = "mine" | "imported"

export type LearningList = {
  id: number
  name: string
  description: string | null
  visibility?: LearningListVisibility
  is_imported?: boolean
}

export type LearningListOwner = {
  id: number
  name: string
  user_id: string
}

export type LearningListItemMembership = {
  piece_id: number
  learning_list_id: number
  learning_lists: LearningListOwner
}

export type LearningListDetail = {
  id: number
  user_id: string
  name: string
  description: string | null
  visibility: LearningListVisibility
  is_imported: boolean
}

export type LearningListItemWithPiece = {
  id: number
  position: number | null
  pieces: Piece | Piece[] | null
}

export type LearningListItem = {
  id?: number
  piece_id?: number
  learning_list_id?: number
  position?: number | null
  pieces?: Piece | Piece[] | null
  learning_lists?: LearningListOwner
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