import Link from "next/link"
import type { ReactNode } from "react"
import EditListModal from "@/components/lists/EditListModal"
import MarkAsKnownButton from "@/components/MarkAsKnownButton"
import TuneMediaLauncher from "@/components/reference-media/TuneMediaLauncher"
import RemoveTuneFromListButton from "@/components/RemoveTuneFromListButton"
import SubmitButton from "@/components/SubmitButton"
import TuneCard from "@/components/TuneCard"
import TuneIdentity from "@/components/tunes/TuneIdentity"
import TuneMetadataSummary from "@/components/tunes/TuneMetadataSummary"
import TuneStateIndicator from "@/components/tunes/TuneStateIndicator"
import {
  deleteList,
  removeTuneFromList,
  revokeLearningListPrivateShare,
  searchLearningListShareRecipients,
  shareLearningListPrivately,
  updateList,
} from "@/lib/actions/lists"
import { startLearning } from "@/lib/actions/user-pieces"
import { loadLearningListDetailData } from "@/lib/loaders/list-detail"
import type { TuneMediaBundle } from "@/lib/tune-media"
import type { Piece } from "@/lib/types"

type LearningListDetailPageProps = {
  params: Promise<{ id: string }>
  searchParams?: Promise<{
    remove_tune?: string
    edit_list?: string
    share_list?: string
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

const desktopActionPillBase =
  "inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2 text-sm font-semibold shadow-sm"

const desktopPrimaryActionClassName = `${desktopActionPillBase} border border-primary bg-primary text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]`

const desktopSecondaryActionClassName = `${desktopActionPillBase} border border-border bg-card text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]`

const desktopSuccessStatusClassName = `${desktopActionPillBase} border border-success bg-success text-success-foreground`

const desktopPassiveStatusClassName = `${desktopActionPillBase} border border-border bg-card text-muted-foreground`

const desktopRemoveTuneClassName =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-destructive bg-background/70 px-5 py-2 text-sm font-semibold text-destructive shadow-sm transition hover:bg-destructive hover:text-destructive-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"

const mobileButtonBase =
  "inline-flex min-h-10 items-center justify-center rounded-full px-4 py-2 text-sm font-semibold shadow-sm"

const mobilePrimaryActionClassName = `${mobileButtonBase} border border-primary bg-primary text-primary-foreground transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]`

const mobileSecondaryActionClassName = `${mobileButtonBase} border border-border bg-background/70 text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]`

const mobileRemoveTuneClassName =
  "inline-flex min-h-10 items-center justify-center rounded-full border border-destructive bg-background/70 px-4 py-2 text-sm font-semibold text-destructive shadow-sm transition hover:bg-destructive hover:text-destructive-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"

function MobileTuneRow({
  piece,
  listId,
  isAlreadyInPractice,
  isKnown,
  stage,
  redirectTo,
  mediaBundle,
}: {
  piece: Piece
  listId: number
  isAlreadyInPractice: boolean
  isKnown: boolean
  stage: number | null
  redirectTo: string
  mediaBundle: TuneMediaBundle | null
}) {
  return (
    <article className="py-5">
      <div className="min-w-0">
        <TuneIdentity id={piece.id} title={piece.title} />

        <TuneMetadataSummary piece={piece} />

        {mediaBundle?.effectiveReference ? (
          <div className="mt-3">
            <TuneMediaLauncher
              pieceId={piece.id}
              title={piece.title}
              mediaBundle={mediaBundle}
              redirectTo={redirectTo}
              label="Open Reference Media"
              className="text-sm font-medium text-muted-foreground underline underline-offset-4 transition hover:text-foreground"
            />
          </div>
        ) : null}

        <TuneStateIndicator
          isAlreadyInPractice={isAlreadyInPractice}
          isKnown={isKnown}
          stage={stage}
          className="mt-3 flex flex-wrap items-center gap-2"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {!isAlreadyInPractice ? (
          <form action={startLearning}>
            <input type="hidden" name="piece_id" value={piece.id} />
            <input type="hidden" name="redirect_to" value={redirectTo} />

            <SubmitButton
              label="Start Practice"
              pendingLabel="Starting..."
              className={mobilePrimaryActionClassName}
            />
          </form>
        ) : null}

        {!isKnown ? (
          <MarkAsKnownButton
            pieceId={piece.id}
            redirectTo={redirectTo}
            label={isAlreadyInPractice ? "Move to Known" : "Mark Known"}
            className={mobileSecondaryActionClassName}
            confirmMessage={
              isAlreadyInPractice
                ? `Move "${piece.title}" to Known? Active Practice and review scheduling will stop.`
                : undefined
            }
          />
        ) : null}

        <RemoveTuneFromListButton
          listId={listId}
          pieceId={piece.id}
          tuneTitle={piece.title}
          redirectTo={redirectTo}
          className={mobileRemoveTuneClassName}
        />
      </div>
    </article>
  )
}

function DesktopTuneActions({
  piece,
  listId,
  isAlreadyInPractice,
  isKnown,
  stage,
  redirectTo,
}: {
  piece: Piece
  listId: number
  isAlreadyInPractice: boolean
  isKnown: boolean
  stage: number | null
  redirectTo: string
}) {
  return (
    <div className="flex w-full flex-wrap items-center gap-3">
      {isAlreadyInPractice ? (
        <span className={desktopSuccessStatusClassName}>
          {stage ? `Already in practice · Stage ${stage}` : "Already in practice"}
        </span>
      ) : (
        <form action={startLearning}>
          <input type="hidden" name="piece_id" value={piece.id} />
          <input type="hidden" name="redirect_to" value={redirectTo} />

          <SubmitButton
            label="Start Practice"
            pendingLabel="Starting..."
            className={desktopPrimaryActionClassName}
          />
        </form>
      )}

      {isKnown ? (
        <span className={desktopPassiveStatusClassName}>Known</span>
      ) : (
        <MarkAsKnownButton
          pieceId={piece.id}
          redirectTo={redirectTo}
          label={isAlreadyInPractice ? "Move to Known" : "Mark Known"}
          className={desktopSecondaryActionClassName}
          confirmMessage={
            isAlreadyInPractice
              ? `Move "${piece.title}" to Known? Active Practice and review scheduling will stop.`
              : undefined
          }
        />
      )}

      <RemoveTuneFromListButton
        listId={listId}
        pieceId={piece.id}
        tuneTitle={piece.title}
        redirectTo={redirectTo}
        className={desktopRemoveTuneClassName}
      />
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
  const shareListStatus = resolvedSearchParams?.share_list ?? ""

  const {
    typedList,
    typedItems,
    tunes,
    activePieceStates,
    knownPieceIds,
    mediaBundles,
    ownerProfile,
    shareRecipients,
    accessMode,
    redirectTo,
  } = await loadLearningListDetailData(id)
  const isOwner = accessMode === "owner"

  const visibleItems = typedItems
    .map((item) => ({
      item,
      piece: extractPiece(item.pieces),
    }))
    .filter(
      (entry): entry is { item: typeof entry.item; piece: Piece } =>
        entry.piece !== null
    )

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-5 text-foreground md:px-6 md:py-8">
      <div className="mb-5">
        <Link
          href="/learning-lists"
          className="text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Back to Lists
        </Link>
      </div>

      <header className="rounded-3xl border border-border bg-card p-5 shadow-sm md:p-6">
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
                    Your editable copy
                  </span>
                </>
              )}

              {accessMode === "shared_viewer" ? (
                <>
                  <span aria-hidden="true">•</span>
                  <span>Shared by {ownerProfile.label}</span>
                </>
              ) : null}
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

          {isOwner ? (
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
              shareLearningListPrivately={shareLearningListPrivately}
              searchLearningListShareRecipients={searchLearningListShareRecipients}
              revokeLearningListPrivateShare={revokeLearningListPrivateShare}
              shareRecipients={shareRecipients}
              triggerLabel="Manage List"
            />
          ) : null}
        </div>
      </header>

      {removeTuneStatus === "success" && (
        <StatusMessage tone="success">Tune removed from your app.</StatusMessage>
      )}

      {removeTuneStatus === "missing_piece" && (
        <StatusMessage tone="warning">
          Couldn’t tell which tune to remove.
        </StatusMessage>
      )}

      {removeTuneStatus === "error" && (
        <StatusMessage tone="error">Couldn’t remove tune.</StatusMessage>
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
          Couldn’t tell which list to edit.
        </StatusMessage>
      )}

      {editListStatus === "missing_name" && (
        <StatusMessage tone="warning">Please enter a list name.</StatusMessage>
      )}

      {editListStatus === "missing_item" && (
        <StatusMessage tone="warning">
          Couldn’t tell which tune to remove from the list.
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
        <StatusMessage tone="error">Couldn’t update list.</StatusMessage>
      )}

      {shareListStatus === "success" && (
        <StatusMessage tone="success">Private access shared.</StatusMessage>
      )}

      {shareListStatus === "removed" && (
        <StatusMessage tone="success">Private access removed.</StatusMessage>
      )}

      {(shareListStatus === "duplicate" ||
        shareListStatus === "already_shared") && (
        <StatusMessage tone="warning">
          That person already has access.
        </StatusMessage>
      )}

      {(shareListStatus === "self" || shareListStatus === "self_share") && (
        <StatusMessage tone="warning">
          You already own this list, so you cannot share it with yourself.
        </StatusMessage>
      )}

      {(shareListStatus === "unknown_user" ||
        shareListStatus === "invalid_recipient" ||
        shareListStatus === "recipient_not_available") && (
        <StatusMessage tone="warning">
          No matching user could be shared with.
        </StatusMessage>
      )}

      {shareListStatus === "not_owner" && (
        <StatusMessage tone="error">
          You can only share lists you own.
        </StatusMessage>
      )}

      {["missing_list", "missing_recipient", "missing_share"].includes(
        shareListStatus
      ) && (
        <StatusMessage tone="warning">
          Check the sharing details and try again.
        </StatusMessage>
      )}

      {(shareListStatus === "error" || shareListStatus === "insert_error") && (
        <StatusMessage tone="error">Couldn’t update private access.</StatusMessage>
      )}

      <section className="mt-8 md:hidden">
        <h2 className="px-1 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Tunes
        </h2>

        {visibleItems.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
            This list has no tunes yet.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-border/70 border-y border-border/70">
            {visibleItems.map(({ item, piece }) => {
              const activePieceState = activePieceStates.get(piece.id) ?? null
              const isAlreadyInPractice = Boolean(activePieceState)
              const isKnown = knownPieceIds.has(piece.id)
              return (
                <MobileTuneRow
                  key={item.id}
                  piece={piece}
                  listId={typedList.id}
                  isAlreadyInPractice={isAlreadyInPractice}
                  isKnown={isKnown}
                  stage={activePieceState?.stage ?? null}
                  redirectTo={redirectTo}
                  mediaBundle={mediaBundles.get(piece.id) ?? null}
                />
              )
            })}
          </div>
        )}
      </section>

      <section className="mt-8 hidden rounded-3xl border border-border bg-card p-6 shadow-sm md:block">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Tunes
        </h2>

        {visibleItems.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
            This list has no tunes yet.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            {visibleItems.map(({ item, piece }) => {
              const activePieceState = activePieceStates.get(piece.id) ?? null
              const isAlreadyInPractice = Boolean(activePieceState)
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
                  mediaBundle={mediaBundles.get(piece.id) ?? null}
                  pieceStyles={piece.piece_styles}
                  listLinks={[]}
                  redirectTo={redirectTo}
                >
                  <DesktopTuneActions
                    piece={piece}
                    listId={typedList.id}
                    isAlreadyInPractice={isAlreadyInPractice}
                    isKnown={isKnown}
                    stage={activePieceState?.stage ?? null}
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
