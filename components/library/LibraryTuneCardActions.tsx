"use client"

import ContextActionMenu, { type ContextAction } from "@/components/ui/ContextActionMenu"
import { markAsKnown } from "@/lib/actions/known-pieces"
import { removeFromPractice } from "@/lib/actions/user-pieces"
import type { Piece } from "@/lib/types"

type LibraryTuneCardActionsProps = {
  piece: Piece
  isAlreadyInPractice: boolean
  activeUserPieceId?: number
  isKnown: boolean
  redirectTo: string
  onOpenAddToList: () => void
  startLearning: (formData: FormData) => Promise<void>
  onPreview?: (trigger: HTMLButtonElement) => void
  referenceHref?: string
}

function tuneActionData(pieceId: number, redirectTo: string) {
  const data = new FormData()
  data.set("piece_id", String(pieceId))
  data.set("redirect_to", redirectTo)
  return data
}

export default function LibraryTuneCardActions({
  piece,
  isAlreadyInPractice,
  activeUserPieceId,
  isKnown,
  redirectTo,
  onOpenAddToList,
  startLearning,
  onPreview,
  referenceHref,
}: LibraryTuneCardActionsProps) {
  const actions: ContextAction[] = [
    { id: "open", label: "Open tune", href: `/library/${piece.id}` },
    ...(onPreview ? [{ id: "preview", label: "Preview recording", onSelect: onPreview, completionMessage: null }] : []),
    ...(referenceHref ? [{ id: "reference", label: "Open Reference", href: referenceHref }] : []),
    { id: "list", label: "Add to List", onSelect: onOpenAddToList, completionMessage: null },
    ...(!isAlreadyInPractice ? [{
      id: "practice", label: isKnown ? "Move to Practice" : "Add to Practice",
      onSelect: () => startLearning(tuneActionData(piece.id, redirectTo)),
      ...(isKnown ? { confirmMessage: "Move this tune from Known to Practice? Review scheduling will begin." } : {}),
    }] : []),
    ...(!isKnown ? [{
      id: "known", label: isAlreadyInPractice ? "Move to Known" : "Mark Known",
      onSelect: () => markAsKnown(tuneActionData(piece.id, redirectTo)),
      ...(isAlreadyInPractice ? { confirmMessage: "Move this tune to Known? Practice scheduling will stop." } : {}),
    }] : []),
    ...(activeUserPieceId ? [{
      id: "stop-practice", label: "Stop Practice",
      onSelect: () => {
        const data = new FormData()
        data.set("user_piece_id", String(activeUserPieceId))
        data.set("redirect_to", redirectTo)
        return removeFromPractice(data)
      },
      confirmMessage: "Stop Practice for this tune? Review scheduling will stop. The tune remains in your lists and is not automatically marked Known.",
    }] : []),
  ]

  return <ContextActionMenu
    label={`Actions for ${piece.title}`}
    title={piece.title}
    actions={actions}
    triggerContent={piece.title}
    triggerClassName="inline-flex min-h-11 max-w-full items-center break-words text-left text-base font-semibold leading-tight text-text-primary decoration-action-primary decoration-2 underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] md:text-lg"
  />
}
