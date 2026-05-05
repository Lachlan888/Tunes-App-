import Link from "next/link"
import type { ReactNode } from "react"
import EditListModal from "@/components/lists/EditListModal"
import RemoveTuneButton from "@/components/RemoveTuneButton"
import SubmitButton from "@/components/SubmitButton"
import TuneCard from "@/components/TuneCard"
import {
  deleteList,
  removeTuneFromList,
  updateList,
} from "@/lib/actions/lists"
import { markAsKnown } from "@/lib/actions/known-pieces"
import { startLearning } from "@/lib/actions/user-pieces"
import { loadLearningListDetailData } from "@/lib/loaders/list-detail"
import type { Piece } from "@/lib/types"

type LearningListDetailPageProps = {
  params: Promise<{ id: string }>
  searchParams?: Promise<{
    remove_tune?: string
    edit_list?: string
  }>
}

function extractPiece(piece: Piece | Piece[] | null): Piece | null {
  if (!piece) return null
  return Array.isArray(piece) ? piece[0] ?? null : piece
}

function getStatusClasses(tone: "success" | "warning" | "error") {
  if (tone === "success") {
    return "border-success text-success"
  }

  if (tone === "warning") {
    return "border-warning-strong text-warning-foreground"
  }

  return "border-destructive text-destructive"
}

function StatusMessage({
  tone,
  children,
}: {
  tone: "success" | "warning" | "error"
  children: ReactNode
}) {
  return (
    <div
      className={`mt-6 rounded-2xl border bg-background/70 p-4 text-sm shadow-sm ${getStatusClasses(
        tone
      )}`}
    >
      {children}
    </div>
  )
}

export default async function LearningListDetailPage({
  params,
  searchParams,
}: LearningListDetailPageProps) {
  const { id } = await params

  const resolvedSearchParams = await searchParams
  const removeTuneStatus = resolvedSearchParams?.remove_tune ?? ""
  const editListStatus = resolvedSearchParams?.edit_list ?? ""

  const {
    typedList,
    typedItems,
    tunes,
    activePieceIds,
    knownPieceIds,
    redirectTo,
  } = await loadLearningListDetailData(id)

  return (
    <main className="mx-auto max-w-[1500px] px-6 py-8 text-foreground">
      <div className="mb-5">
        <Link
          href="/learning-lists"
          className="text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Back to Lists
        </Link>
      </div>

      <header className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              {typedList.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium text-muted-foreground">
              <span>
                {typedList.visibility === "public" ? "Public" : "Private"}
              </span>

              <span aria-hidden="true">•</span>

              <span>
                {typedItems.length} tune{typedItems.length === 1 ? "" : "s"}
              </span>

              {typedList.is_imported && (
                <>
                  <span aria-hidden="true">•</span>
                  <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-semibold text-muted-foreground">
                    Imported
                  </span>
                </>
              )}
            </div>

            {typedList.description ? (
              <p className="mt-5 max-w-3xl text-base leading-7 text-foreground">
                {typedList.description}
              </p>
            ) : (
              <p className="mt-5 text-base text-muted-foreground">
                No description yet.
              </p>
            )}
          </div>

          <EditListModal
            listId={typedList.id}
            name={typedList.name}
            description={typedList.description}
            visibility={typedList.visibility}
            redirectTo={redirectTo}
            tunes={tunes}
            updateList={updateList}
            removeTuneFromList={removeTuneFromList}
            deleteList={deleteList}
            triggerLabel="Manage List"
          />
        </div>
      </header>

      {removeTuneStatus === "success" && (
        <StatusMessage tone="success">Tune removed from your app.</StatusMessage>
      )}

      {removeTuneStatus === "missing_piece" && (
        <StatusMessage tone="warning">
          Could not tell which tune to remove.
        </StatusMessage>
      )}

      {removeTuneStatus === "error" && (
        <StatusMessage tone="error">Could not remove tune.</StatusMessage>
      )}

      {editListStatus === "success" && (
        <StatusMessage tone="success">List updated.</StatusMessage>
      )}

      {editListStatus === "removed_tune" && (
        <StatusMessage tone="success">
          Tune removed from this list.
        </StatusMessage>
      )}

      {editListStatus === "deleted" && (
        <StatusMessage tone="success">List deleted.</StatusMessage>
      )}

      {editListStatus === "missing_list" && (
        <StatusMessage tone="warning">
          Could not tell which list to edit.
        </StatusMessage>
      )}

      {editListStatus === "missing_name" && (
        <StatusMessage tone="warning">
          Please enter a list name.
        </StatusMessage>
      )}

      {editListStatus === "missing_item" && (
        <StatusMessage tone="warning">
          Could not tell which tune to remove from the list.
        </StatusMessage>
      )}

      {editListStatus === "invalid_visibility" && (
        <StatusMessage tone="warning">Invalid list visibility.</StatusMessage>
      )}

      {editListStatus === "not_found" && (
        <StatusMessage tone="error">
          List not found or you do not own it.
        </StatusMessage>
      )}

      {editListStatus === "error" && (
        <StatusMessage tone="error">Could not update list.</StatusMessage>
      )}

      <section className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Tunes
        </h2>

        {typedItems.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
            This list has no tunes yet.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            {typedItems.map((item) => {
              const piece = extractPiece(item.pieces)

              if (!piece) return null

              const isAlreadyInPractice = activePieceIds.has(piece.id)
              const isKnown = knownPieceIds.has(piece.id)

              return (
                <TuneCard
                  key={item.id}
                  id={piece.id}
                  title={piece.title}
                  keyValue={piece.key}
                  style={piece.style}
                  timeSignature={piece.time_signature}
                  referenceUrl={piece.reference_url}
                  pieceStyles={piece.piece_styles}
                  listNames={[]}
                >
                  {isAlreadyInPractice ? (
                    <span className="rounded-full border border-success bg-success px-4 py-2 text-sm font-medium text-success-foreground shadow-sm">
                      Already in practice
                    </span>
                  ) : (
                    <form action={startLearning}>
                      <input type="hidden" name="piece_id" value={piece.id} />
                      <input
                        type="hidden"
                        name="redirect_to"
                        value={redirectTo}
                      />
                      <SubmitButton
                        label="Start Practice"
                        pendingLabel="Starting..."
                        className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                      />
                    </form>
                  )}

                  {isKnown ? (
                    <span className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm">
                      Known
                    </span>
                  ) : (
                    <form action={markAsKnown}>
                      <input type="hidden" name="piece_id" value={piece.id} />
                      <input
                        type="hidden"
                        name="redirect_to"
                        value={redirectTo}
                      />
                      <SubmitButton
                        label={
                          isAlreadyInPractice ? "Set as known" : "Mark as known"
                        }
                        pendingLabel="Saving..."
                        className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                      />
                    </form>
                  )}

                  <RemoveTuneButton
                    pieceId={piece.id}
                    redirectTo={redirectTo}
                  />
                </TuneCard>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}