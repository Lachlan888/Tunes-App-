import AddTuneToSetlistModal from "@/components/setlists/AddTuneToSetlistModal"
import EditSetlistModal from "@/components/setlists/EditSetlistModal"
import type { Piece, Setlist } from "@/lib/types"

type SetlistSummary = {
  tuneCount: number
  memberCount: number
  knownByEveryoneCount: number
  gapTuneCount: number
}

type SetlistHeaderProps = {
  setlist: Setlist
  summary: SetlistSummary
  canEdit: boolean
  allPieces: Piece[]
  existingPieceIds: number[]
  redirectTo: string
  addTuneToSetlist: (formData: FormData) => Promise<void>
  updateSetlist: (formData: FormData) => Promise<void>
  deleteSetlist: (formData: FormData) => Promise<void>
}

function pluralise(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`
}

export default function SetlistHeader({
  setlist,
  summary,
  canEdit,
  allPieces,
  existingPieceIds,
  redirectTo,
  addTuneToSetlist,
  updateSetlist,
  deleteSetlist,
}: SetlistHeaderProps) {
  return (
    <header className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Setlist
          </p>

          <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            {setlist.name}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium text-muted-foreground">
            <span>{pluralise(summary.memberCount, "collaborator")}</span>
            <span aria-hidden="true">•</span>
            <span>{pluralise(summary.tuneCount, "tune")}</span>

            {setlist.event_date ? (
              <>
                <span aria-hidden="true">•</span>
                <span>{setlist.event_date}</span>
              </>
            ) : null}

            {setlist.location ? (
              <>
                <span aria-hidden="true">•</span>
                <span>{setlist.location}</span>
              </>
            ) : null}
          </div>

          {setlist.description ? (
            <p className="mt-5 max-w-3xl text-base leading-7 text-foreground">
              {setlist.description}
            </p>
          ) : (
            <p className="mt-5 text-base text-muted-foreground">
              No description yet.
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full border border-border bg-background/70 px-3 py-1.5 text-sm font-medium text-muted-foreground">
              {pluralise(summary.tuneCount, "tune")}
            </span>

            <span className="rounded-full border border-border bg-background/70 px-3 py-1.5 text-sm font-medium text-muted-foreground">
              {pluralise(summary.memberCount, "collaborator")}
            </span>

            <span className="rounded-full border border-success bg-success px-3 py-1.5 text-sm font-medium text-success-foreground">
              {summary.knownByEveryoneCount} known by everyone
            </span>

            <span className="rounded-full border border-warning-strong bg-background/70 px-3 py-1.5 text-sm font-medium text-muted-foreground">
              {summary.gapTuneCount} with gaps
            </span>
          </div>
        </div>

        {canEdit ? (
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <AddTuneToSetlistModal
              setlistId={setlist.id}
              pieces={allPieces}
              existingPieceIds={existingPieceIds}
              redirectTo={redirectTo}
              addTuneToSetlist={addTuneToSetlist}
            />

            <EditSetlistModal
              setlist={setlist}
              redirectTo={redirectTo}
              updateSetlist={updateSetlist}
              deleteSetlist={deleteSetlist}
            />
          </div>
        ) : null}
      </div>
    </header>
  )
}