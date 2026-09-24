"use client"

import { useRef, useState, useTransition } from "react"
import ResponsiveModal from "@/components/ui/ResponsiveModal"
import SubmitButton from "@/components/SubmitButton"
import { buttonStyles } from "@/components/ui/buttonStyles"
import { searchSetlistTunes } from "@/lib/actions/setlists"

export default function AddTuneToSetlistModal({ setlistId, existingPieceIds, redirectTo, addTuneToSetlist }: {
  setlistId: number; existingPieceIds: number[]; redirectTo: string; addTuneToSetlist: (formData: FormData) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [appliedQuery, setAppliedQuery] = useState("")
  const [page, setPage] = useState(0)
  const [result, setResult] = useState<Awaited<ReturnType<typeof searchSetlistTunes>>>({ pieces: [], hasNext: false, error: null })
  const [pending, startTransition] = useTransition()
  const request = useRef(0)
  function search(nextPage: number, term = appliedQuery) {
    const sequence = ++request.current
    startTransition(async () => {
      try {
        const response = await searchSetlistTunes({ setlistId, query: term, page: nextPage })
        if (sequence !== request.current) return
        setResult(response); setPage(nextPage); setAppliedQuery(term)
      } catch { if (sequence === request.current) setResult({ pieces: [], hasNext: false, error: "Connection interrupted. Try searching again." }) }
    })
  }
  return <>
    <button type="button" className={buttonStyles.primary} onClick={() => { setOpen(true); search(0, query) }}>Add Tune</button>
    <ResponsiveModal isOpen={open} onClose={() => setOpen(false)} mobileMode="sheet" desktopMaxWidth="md:max-w-2xl" title="Add Tune">
      <p className="mb-3 text-sm text-text-muted">Tunes are added at the end, preserving the running order.</p>
      <form onSubmit={event => { event.preventDefault(); search(0, query) }} className="flex gap-2">
        <input aria-label="Search tunes by title" value={query} onChange={event => setQuery(event.target.value)} maxLength={100} className="min-h-11 min-w-0 flex-1 rounded-xl border border-hairline bg-background px-3" placeholder="Search tune titles" />
        <button disabled={pending} className={`${buttonStyles.secondary} !w-auto shrink-0`}>{pending ? "Searching…" : "Search"}</button>
      </form>
      <div aria-live="polite" aria-busy={pending}>
        {result.error ? <p role="alert" className="py-4 text-destructive">{result.error}</p> : null}
        {!pending && !result.error && !result.pieces.length ? <p className="py-4">No matching tunes. Try another title.</p> : null}
        <ul className="mt-3 divide-y divide-hairline">
          {result.pieces.map(piece => <li key={piece.id} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0"><p className="break-words font-semibold">{piece.title}</p><p className="text-sm text-text-muted">{[piece.key, piece.style].filter(Boolean).join(" · ")}</p></div>
            {existingPieceIds.includes(piece.id) ? <span className="text-sm text-text-muted">Already in set</span> : <form action={addTuneToSetlist}>
              <input type="hidden" name="setlist_id" value={setlistId} /><input type="hidden" name="piece_id" value={piece.id} /><input type="hidden" name="redirect_to" value={redirectTo} />
              <SubmitButton label="Add" pendingLabel="Adding…" className={`${buttonStyles.secondary} !w-auto shrink-0`} />
            </form>}
          </li>)}
        </ul>
      </div>
      <div className="sticky bottom-0 flex items-center justify-between gap-2 border-t border-hairline bg-card py-3">
        <button disabled={pending || page === 0} onClick={() => search(page - 1)} className={`${buttonStyles.secondary} !w-auto shrink-0`}>Previous</button>
        <span className="whitespace-nowrap text-sm">Page {page + 1}</span>
        <button disabled={pending || !result.hasNext} onClick={() => search(page + 1)} className={`${buttonStyles.secondary} !w-auto shrink-0`}>Next</button>
      </div>
    </ResponsiveModal>
  </>
}
