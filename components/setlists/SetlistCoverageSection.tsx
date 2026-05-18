import AddTuneToSetlistModal from "@/components/setlists/AddTuneToSetlistModal"
import SetlistTuneMatrix from "@/components/setlists/SetlistTuneMatrix"
import type { Piece, SetlistItemWithCoverage, SetlistMember } from "@/lib/types"

type SetlistCoverageSectionProps = {
  currentUserId: string
  setlistId: number
  acceptedMembers: SetlistMember[]
  items: SetlistItemWithCoverage[]
  allPieces: Piece[]
  canEdit: boolean
  redirectTo: string
  addTuneToSetlist: (formData: FormData) => Promise<void>
  startLearning: (formData: FormData) => Promise<void>
  markAsKnown: (formData: FormData) => Promise<void>
  removeFromPractice: (formData: FormData) => Promise<void>
  moveSetlistItem: (formData: FormData) => Promise<void>
  removeTuneFromSetlist: (formData: FormData) => Promise<void>
  updateSetlistItem: (formData: FormData) => Promise<void>
}

export default function SetlistCoverageSection({
  currentUserId,
  setlistId,
  acceptedMembers,
  items,
  allPieces,
  canEdit,
  redirectTo,
  addTuneToSetlist,
  startLearning,
  markAsKnown,
  removeFromPractice,
  moveSetlistItem,
  removeTuneFromSetlist,
  updateSetlistItem,
}: SetlistCoverageSectionProps) {
  const existingPieceIds = items.map((item) => item.piece_id)

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Tunes and coverage
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Coverage comes from each collaborator’s Known and Practice state.
            Setlist membership itself does not make a tune known.
          </p>
        </div>

        {canEdit ? (
          <AddTuneToSetlistModal
            setlistId={setlistId}
            pieces={allPieces}
            existingPieceIds={existingPieceIds}
            redirectTo={redirectTo}
            addTuneToSetlist={addTuneToSetlist}
          />
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-border bg-background/70 p-5 text-sm text-muted-foreground">
          This setlist has no tunes yet.
        </p>
      ) : (
        <SetlistTuneMatrix
          currentUserId={currentUserId}
          members={acceptedMembers}
          items={items}
          canEdit={canEdit}
          redirectTo={redirectTo}
          startLearning={startLearning}
          markAsKnown={markAsKnown}
          removeFromPractice={removeFromPractice}
          moveSetlistItem={moveSetlistItem}
          removeTuneFromSetlist={removeTuneFromSetlist}
          updateSetlistItem={updateSetlistItem}
        />
      )}
    </section>
  )
}