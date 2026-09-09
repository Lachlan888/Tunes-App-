"use client"

import { useMemo, useRef, useState } from "react"
import AddToListModal from "@/components/AddToListModal"
import PendingLinkButton from "@/components/PendingLinkButton"
import SubmitButton from "@/components/SubmitButton"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import { useSessionDock } from "@/components/session-dock/SessionDockProvider"
import type { SessionDockModel } from "@/components/session-dock/sessionDockModel"
import type {
  BookmarkedSharedListSummary,
  DirectSharedListSummary,
  LearningQueueTune,
} from "@/lib/loaders/lists"
import type {
  LearningList,
  UserKnownPieceWithPiece,
  UserPieceWithPiece,
} from "@/lib/types"

type PieceForListModal = {
  id: number
  title: string
  key: string | null
  style: string | null
  time_signature: string | null
}

type LearningQueueViewProps = {
  learningQueueTunes: LearningQueueTune[]
  startLearning: (formData: FormData) => Promise<void>
  redirectTo: string
  startSelectedListTunes: (formData: FormData) => Promise<void>
}

type UnsortedViewProps = {
  unlistedPracticeTunes: UserPieceWithPiece[]
  unlistedKnownTunes: UserKnownPieceWithPiece[]
  learningLists: LearningList[]
  addToLearningList: (formData: FormData) => Promise<void>
  redirectTo: string
}

type SavedSharedViewProps = {
  bookmarkedSharedLists: BookmarkedSharedListSummary[]
  directSharedLists: DirectSharedListSummary[]
  unbookmarkPublicList: (formData: FormData) => Promise<void>
  redirectTo: string
}

function formatAddedDate(value: string | null) {
  if (!value) return "Saved earlier"

  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

function getListNamesText(listNames: string[]) {
  if (listNames.length === 0) return "No list"
  if (listNames.length === 1) return listNames[0]

  const [firstListName, ...remainingListNames] = listNames

  return `${firstListName} + ${remainingListNames.length} more`
}

function extractJoinedPiece(
  piece:
    | {
        id: number
        title: string
      }
    | {
        id: number
        title: string
      }[]
    | null
) {
  if (!piece) return null
  return Array.isArray(piece) ? piece[0] ?? null : piece
}

function tuneCountLabel(count: number) {
  return `${count} tune${count === 1 ? "" : "s"}`
}

const rowClassName =
  "border-b border-border/70 px-1 py-4 last:border-b-0 md:px-2 md:py-5"

export function LearningQueueView({
  learningQueueTunes,
  startLearning,
  startSelectedListTunes,
  redirectTo,
}: LearningQueueViewProps) {
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const batchFormRef = useRef<HTMLFormElement>(null)
  const dockModel = useMemo<SessionDockModel | null>(() => {
    if (!isSelecting) return null
    return {
      id: "learning-queue-selection",
      context: "list-selection",
      identity: {
        eyebrow: "Learning Queue",
        title: `${selectedIds.length} selected`,
        detail: "Choose up to 50 tunes on this page.",
      },
      primaryAction: {
        id: "start-selected",
        label: "Start selected",
        tone: "primary",
        disabled: selectedIds.length === 0,
        onInvoke: () => batchFormRef.current?.requestSubmit(),
      },
      secondaryActions: [
        {
          id: "clear-selection",
          label: "Clear",
          tone: "secondary",
          disabled: selectedIds.length === 0,
          onInvoke: () => setSelectedIds([]),
        },
        {
          id: "exit-selection",
          label: "Done",
          tone: "secondary",
          onInvoke: () => {
            setSelectedIds([])
            setIsSelecting(false)
          },
        },
      ],
      collapsedContent: { actionIds: ["start-selected"] },
      expandedContent: {
        title: "Start several tunes",
        description: "Only tunes in lists you own are accepted. Existing Practice tunes are left unchanged.",
        actionIds: ["start-selected", "clear-selection", "exit-selection"],
      },
      persistence: { shareable: "none", transient: "session", key: "learning-queue-selection" },
    }
  }, [isSelecting, selectedIds.length])
  useSessionDock("learning-queue-selection", dockModel)

  if (learningQueueTunes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-5 text-sm text-muted-foreground">
        Tunes you add to lists but have not started practising or marked Known
        will appear here.
      </div>
    )
  }

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Stage and next action stay visible without opening each tune.</p>
        <button type="button" onClick={() => { setSelectedIds([]); setIsSelecting((value) => !value) }} className={buttonStyles.secondary} aria-pressed={isSelecting}>
          {isSelecting ? "Cancel select" : "Select"}
        </button>
      </div>
      <ul className="divide-y-0 border-y border-border/70 md:rounded-3xl md:border md:bg-card md:px-5 md:shadow-sm">
      {learningQueueTunes.map((queueTune) => {
        const tuneTitle = queueTune.piece.title
        const listText = getListNamesText(queueTune.listNames)

        return (
          <li key={queueTune.piece.id} className={rowClassName}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                {isSelecting ? (
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(queueTune.piece.id)}
                    onChange={(event) => setSelectedIds((current) => event.target.checked ? [...current, queueTune.piece.id].slice(0, 50) : current.filter((id) => id !== queueTune.piece.id))}
                    aria-label={`Select ${tuneTitle}`}
                    className="mt-1 h-5 w-5 shrink-0 accent-primary"
                  />
                ) : null}
                <div className="min-w-0">
                <PendingLinkButton
                  href={`/library/${queueTune.piece.id}`}
                  label={tuneTitle}
                  pendingLabel={`Opening ${tuneTitle}...`}
                  className="cursor-pointer text-left font-semibold text-foreground underline underline-offset-4"
                />

                <p className="mt-1 text-sm text-muted-foreground">
                  {[
                    queueTune.piece.key,
                    queueTune.piece.time_signature,
                  ].filter(Boolean).join(" · ") || "No key or time signature set"}
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  In: {listText}
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  First saved: {formatAddedDate(queueTune.firstAddedAt)}
                </p>
                </div>
              </div>

              {!isSelecting ? <form action={startLearning}>
                <input
                  type="hidden"
                  name="piece_id"
                  value={queueTune.piece.id}
                />
                <input type="hidden" name="redirect_to" value={redirectTo} />

                <SubmitButton
                  label="Start Practice"
                  pendingLabel="Starting..."
                  className={buttonStyles.primary}
                />
              </form> : null}
            </div>
          </li>
        )
      })}
      </ul>
      <form ref={batchFormRef} action={startSelectedListTunes} className="hidden">
        <input type="hidden" name="redirect_to" value={redirectTo} />
        {selectedIds.map((pieceId) => <input key={pieceId} type="hidden" name="piece_ids" value={pieceId} />)}
      </form>
    </>
  )
}

export function UnsortedView({
  unlistedPracticeTunes,
  unlistedKnownTunes,
  learningLists,
  addToLearningList,
  redirectTo,
}: UnsortedViewProps) {
  const [selectedPiece, setSelectedPiece] = useState<PieceForListModal | null>(
    null
  )
  const [selectedListId, setSelectedListId] = useState("")
  const hasUnsorted =
    unlistedPracticeTunes.length > 0 || unlistedKnownTunes.length > 0

  function selectPiece(pieceId: number, title: string) {
    setSelectedPiece({
      id: pieceId,
      title,
      key: null,
      style: null,
      time_signature: null,
    })
    setSelectedListId("")
  }

  if (!hasUnsorted) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-5 text-sm text-muted-foreground">
        Every Known or in-practice tune is already represented in at least one
        list.
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              In Practice, Not In A List
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              These tunes are actively scheduled for review but have no list
              home yet.
            </p>
          </div>

          {unlistedPracticeTunes.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
              No in-practice tunes need list organisation.
            </p>
          ) : (
            <ul className="border-y border-border/70 md:rounded-3xl md:border md:bg-card md:px-5 md:shadow-sm">
              {unlistedPracticeTunes.map((userPiece) => {
                const piece = extractJoinedPiece(userPiece.pieces)
                const pieceTitle = piece?.title ?? "Untitled tune"

                return (
                  <li key={userPiece.id} className={rowClassName}>
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <PendingLinkButton
                          href={`/library/${userPiece.piece_id}`}
                          label={pieceTitle}
                          pendingLabel={`Opening ${pieceTitle}...`}
                          className="cursor-pointer text-left font-semibold text-foreground underline underline-offset-4"
                        />
                        <p className="mt-1 text-sm text-muted-foreground">
                          Stage {userPiece.stage} · In Practice but not in any
                          list
                        </p>
                      </div>

                      <button
                        type="button"
                        className={buttonStyles.secondary}
                        onClick={() =>
                          selectPiece(userPiece.piece_id, pieceTitle)
                        }
                      >
                        Add to List
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section>
          <div className="mb-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Known, Not In A List
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              These tunes are marked Known but are not organised into a list.
            </p>
          </div>

          {unlistedKnownTunes.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
              No Known tunes need list organisation.
            </p>
          ) : (
            <ul className="border-y border-border/70 md:rounded-3xl md:border md:bg-card md:px-5 md:shadow-sm">
              {unlistedKnownTunes.map((userKnownPiece) => {
                const piece = extractJoinedPiece(userKnownPiece.pieces)
                const pieceTitle = piece?.title ?? "Untitled tune"

                return (
                  <li key={userKnownPiece.id} className={rowClassName}>
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <PendingLinkButton
                          href={`/library/${userKnownPiece.piece_id}`}
                          label={pieceTitle}
                          pendingLabel={`Opening ${pieceTitle}...`}
                          className="cursor-pointer text-left font-semibold text-foreground underline underline-offset-4"
                        />
                        <p className="mt-1 text-sm text-muted-foreground">
                          Known but not in any list
                        </p>
                      </div>

                      <button
                        type="button"
                        className={buttonStyles.secondary}
                        onClick={() =>
                          selectPiece(userKnownPiece.piece_id, pieceTitle)
                        }
                      >
                        Add to List
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>

      {selectedPiece ? (
        <AddToListModal
          selectedPiece={selectedPiece}
          selectedListId={selectedListId}
          learningLists={learningLists}
          existingListIds={[]}
          redirectTo={redirectTo}
          addToLearningList={addToLearningList}
          onChangeSelectedListId={setSelectedListId}
          onClose={() => {
            setSelectedPiece(null)
            setSelectedListId("")
          }}
        />
      ) : null}
    </>
  )
}

export function SavedSharedView({
  bookmarkedSharedLists,
  directSharedLists,
  unbookmarkPublicList,
  redirectTo,
}: SavedSharedViewProps) {
  const hasSavedOrShared =
    bookmarkedSharedLists.length > 0 || directSharedLists.length > 0

  if (!hasSavedOrShared) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-5 text-sm text-muted-foreground">
        Bookmarked public lists and lists shared directly with you will appear
        here.
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section>
        <div className="mb-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Bookmarked Public Lists
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Public lists you saved as references.
          </p>
        </div>

        {bookmarkedSharedLists.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
            No bookmarked public lists yet.
          </p>
        ) : (
          <ul className="border-y border-border/70 md:rounded-3xl md:border md:bg-card md:px-5 md:shadow-sm">
            {bookmarkedSharedLists.map((list) => (
              <li key={list.id} className={rowClassName}>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <PendingLinkButton
                      href={`/public-lists/${list.id}`}
                      label={list.name}
                      pendingLabel="Opening..."
                      className="cursor-pointer text-left font-semibold text-foreground underline underline-offset-4"
                    />
                    <p className="mt-1 text-sm text-muted-foreground">
                      By {list.ownerLabel} · {tuneCountLabel(list.tuneCount)}
                    </p>
                    {list.description ? (
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {list.description}
                      </p>
                    ) : null}
                  </div>

                  <form action={unbookmarkPublicList} className="shrink-0">
                    <input
                      type="hidden"
                      name="learning_list_id"
                      value={list.id}
                    />
                    <input type="hidden" name="redirect_to" value={redirectTo} />
                    <SubmitButton
                      label="Remove bookmark"
                      pendingLabel="Removing..."
                      className={joinClasses(
                        buttonStyles.secondary,
                        "min-h-10 w-full md:w-auto"
                      )}
                    />
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="mb-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Shared Directly With Me
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Private lists where another player gave you read-only access.
          </p>
        </div>

        {directSharedLists.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
            No directly shared lists yet.
          </p>
        ) : (
          <ul className="border-y border-border/70 md:rounded-3xl md:border md:bg-card md:px-5 md:shadow-sm">
            {directSharedLists.map((list) => (
              <li key={list.id} className={rowClassName}>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <h4 className="text-base font-semibold text-foreground">
                      {list.name}
                    </h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Shared by {list.ownerLabel} ·{" "}
                      {tuneCountLabel(list.tuneCount)}
                    </p>
                    {list.description ? (
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {list.description}
                      </p>
                    ) : null}
                  </div>

                  <PendingLinkButton
                    href={`/learning-lists/${list.id}`}
                    label="Open"
                    pendingLabel="Opening..."
                    className={buttonStyles.primary}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
