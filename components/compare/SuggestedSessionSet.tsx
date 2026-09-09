"use client"

import { useMemo, useState } from "react"
import SubmitButton from "@/components/SubmitButton"
import { createSetlistFromComparison } from "@/lib/actions/compare"
import type { Piece } from "@/lib/types"

type Props = {
  suggestedIds: number[]
  playablePieces: Piece[]
  compareUsernames: string[]
}

export default function SuggestedSessionSet({
  suggestedIds,
  playablePieces,
  compareUsernames,
}: Props) {
  const [selectedIds, setSelectedIds] = useState(suggestedIds)
  const pieceById = useMemo(
    () => new Map(playablePieces.map((piece) => [piece.id, piece])),
    [playablePieces]
  )
  const candidates = playablePieces.slice(0, 20)

  function toggle(pieceId: number) {
    setSelectedIds((current) =>
      current.includes(pieceId)
        ? current.filter((id) => id !== pieceId)
        : current.length < 12
          ? [...current, pieceId]
          : current
    )
  }

  function move(pieceId: number, offset: -1 | 1) {
    setSelectedIds((current) => {
      const index = current.indexOf(pieceId)
      const target = index + offset
      if (index < 0 || target < 0 || target >= current.length) return current
      const next = [...current]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  return (
    <section className="border-y border-hairline py-5" aria-labelledby="session-set-title">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
        Suggested session
      </p>
      <h2 id="session-set-title" className="mt-1 text-xl font-semibold text-text-primary">
        A short set to play now
      </h2>
      <p className="mt-2 text-sm text-text-muted">
        Review the order, swap tunes, then save a private setlist if it feels right.
      </p>

      {selectedIds.length > 0 ? (
        <ol className="mt-4 divide-y divide-hairline border-y border-hairline">
          {selectedIds.map((pieceId, index) => {
            const piece = pieceById.get(pieceId)
            if (!piece) return null
            return (
              <li key={pieceId} className="flex min-h-12 items-center gap-3 py-2">
                <span className="w-6 text-sm font-semibold text-text-muted">{index + 1}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{piece.title}</span>
                <button type="button" onClick={() => move(pieceId, -1)} disabled={index === 0} aria-label={`Move ${piece.title} earlier`} className="min-h-11 min-w-11 disabled:opacity-30">↑</button>
                <button type="button" onClick={() => move(pieceId, 1)} disabled={index === selectedIds.length - 1} aria-label={`Move ${piece.title} later`} className="min-h-11 min-w-11 disabled:opacity-30">↓</button>
                <button type="button" onClick={() => toggle(pieceId)} aria-label={`Remove ${piece.title}`} className="min-h-11 px-2 text-sm text-text-muted">Remove</button>
              </li>
            )
          })}
        </ol>
      ) : (
        <p className="mt-4 text-sm text-text-muted">Choose at least one shared tune below.</p>
      )}

      <details className="mt-4">
        <summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold">Adjust tunes</summary>
        <div className="grid gap-2 sm:grid-cols-2">
          {candidates.map((piece) => (
            <label key={piece.id} className="flex min-h-11 items-center gap-3 border-b border-hairline py-2 text-sm">
              <input type="checkbox" checked={selectedIds.includes(piece.id)} onChange={() => toggle(piece.id)} />
              <span>{piece.title}</span>
            </label>
          ))}
        </div>
      </details>

      <form action={createSetlistFromComparison} className="mt-5 space-y-3">
        {compareUsernames.map((username) => (
          <input key={username} type="hidden" name="compare_user" value={username} />
        ))}
        {selectedIds.map((pieceId) => (
          <input key={pieceId} type="hidden" name="piece_id" value={pieceId} />
        ))}
        <label className="block text-sm font-medium">
          Setlist name
          <input name="name" defaultValue="Tunes to play together" maxLength={80} required className="mt-2 min-h-11 w-full rounded-control border border-hairline bg-surface-paper px-3" />
        </label>
        <label className="flex items-start gap-3 text-sm text-text-muted">
          <input type="checkbox" name="confirm_private" value="yes" required className="mt-1" />
          <span>Create this as my private setlist. Other musicians are not added automatically.</span>
        </label>
        <SubmitButton
          label="Save private setlist"
          pendingLabel="Saving setlist…"
          disabled={selectedIds.length === 0}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-text-primary px-5 text-sm font-semibold text-surface-paper"
        />
      </form>
    </section>
  )
}
