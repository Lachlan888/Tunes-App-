import type { Piece } from "@/lib/types"
import type { TuneCollectionScope } from "@/lib/tune-collections/pagination"

export type TuneCollectionIdentity = Pick<
  Piece,
  | "id"
  | "title"
  | "alternate_titles"
  | "type"
  | "key"
  | "style"
  | "time_signature"
  | "composer"
  | "reference_url"
  | "created_at"
  | "piece_styles"
>

export type TuneCollectionPrivateDataByScope = {
  catalogue: {
    state: "new" | "known" | "practice"
    stage?: number | null
    ownedListIds: number[]
  }
  known: { membershipId: number }
  practice: {
    userPieceId: number
    stage: number
    nextReviewDue: string | null
  }
  "learning-queue": {
    firstAddedAt: string | null
    ownedListIds: number[]
  }
  "list-membership": {
    position: number | null
    viewerState?: "new" | "known" | "practice"
  }
  "profile-repertoire": {
    profileState: "known" | "practice"
    viewerState?: "new" | "known" | "practice" | "listed"
  }
  compare: Record<string, never>
}

export type TuneCollectionItem<Scope extends TuneCollectionScope> = {
  scope: Scope
  identity: TuneCollectionIdentity
  privateData: TuneCollectionPrivateDataByScope[Scope]
}

/**
 * Explicitly copies the public tune identity. Membership/user rows are never
 * spread into this object, which keeps public Profile and Compare adapters from
 * accidentally inheriting private catalogue state.
 */
export function toTuneCollectionIdentity(piece: Piece): TuneCollectionIdentity {
  return {
    id: piece.id,
    title: piece.title,
    alternate_titles: piece.alternate_titles,
    type: piece.type,
    key: piece.key,
    style: piece.style,
    time_signature: piece.time_signature,
    composer: piece.composer,
    reference_url: piece.reference_url,
    created_at: piece.created_at,
    piece_styles: piece.piece_styles,
  }
}

export function adaptTuneCollectionItem<Scope extends TuneCollectionScope>(
  scope: Scope,
  piece: Piece,
  privateData: TuneCollectionPrivateDataByScope[Scope]
): TuneCollectionItem<Scope> {
  return {
    scope,
    identity: toTuneCollectionIdentity(piece),
    privateData,
  }
}
