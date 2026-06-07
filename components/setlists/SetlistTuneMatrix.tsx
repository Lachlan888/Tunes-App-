"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import EditSetlistItemModal from "@/components/setlists/EditSetlistItemModal"
import SubmitButton from "@/components/SubmitButton"
import UserIdentityLink from "@/components/UserIdentityLink"
import { buttonStyles } from "@/components/ui/buttonStyles"
import type { SetlistItemWithCoverage, SetlistMember } from "@/lib/types"

type SetlistTuneMatrixProps = {
  currentUserId: string
  members: SetlistMember[]
  items: SetlistItemWithCoverage[]
  canEdit: boolean
  redirectTo: string
  startLearning: (formData: FormData) => Promise<void>
  markAsKnown: (formData: FormData) => Promise<void>
  removeFromPractice: (formData: FormData) => Promise<void>
  moveSetlistItem: (formData: FormData) => Promise<void>
  removeTuneFromSetlist: (formData: FormData) => Promise<void>
  updateSetlistItem: (formData: FormData) => Promise<void>
}

type CurrentUserCoverage = {
  status: "known" | "practice" | "gap"
  stage: number | null
  user_piece_id: number | null
}

function memberLabel(member: SetlistMember) {
  return member.profile?.display_name || member.profile?.username || "Unknown"
}

function coverageLabel(
  coverage:
    | {
        status: "known" | "practice" | "gap"
        stage: number | null
      }
    | undefined
) {
  if (!coverage) return "Gap"

  if (coverage.status === "known") return "Known"

  if (coverage.status === "practice") {
    return coverage.stage ? `Stage ${coverage.stage}` : "Already in practice"
  }

  return "Gap"
}

function coverageClass(
  coverage:
    | {
        status: "known" | "practice" | "gap"
        stage: number | null
      }
    | undefined
) {
  if (!coverage || coverage.status === "gap") {
    return "border-warning-strong bg-background/70 text-muted-foreground"
  }

  if (coverage.status === "known") {
    return "border-success bg-success text-success-foreground"
  }

  return "border-primary bg-card text-foreground"
}

function myStatusLabel(coverage: CurrentUserCoverage | undefined) {
  if (!coverage || coverage.status === "gap") return "Add to my tunes"
  if (coverage.status === "known") return "Known"
  return "Already in practice"
}

function MyStatusDropdown({
  item,
  currentUserCoverage,
  isOpen,
  redirectTo,
  onToggle,
  onClose,
  startLearning,
  markAsKnown,
  removeFromPractice,
}: {
  item: SetlistItemWithCoverage
  currentUserCoverage: CurrentUserCoverage | undefined
  isOpen: boolean
  redirectTo: string
  onToggle: () => void
  onClose: () => void
  startLearning: (formData: FormData) => Promise<void>
  markAsKnown: (formData: FormData) => Promise<void>
  removeFromPractice: (formData: FormData) => Promise<void>
}) {
  const piece = item.piece
  const title = piece?.title ?? "this tune"
  const isAlreadyInPractice = currentUserCoverage?.status === "practice"
  const isKnown = currentUserCoverage?.status === "known"
  const hasUserRelationship = isAlreadyInPractice || isKnown
  const statusLabel = myStatusLabel(currentUserCoverage)

  return (
    <div className="relative" data-setlist-status-dropdown-root>
      <button
        type="button"
        className={
          hasUserRelationship
            ? buttonStyles.statusTrigger
            : buttonStyles.statusTriggerEmpty
        }
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <span>
          {hasUserRelationship ? (
            <>
              <span className="text-muted-foreground">My status: </span>
              {statusLabel}
            </>
          ) : (
            statusLabel
          )}
        </span>

        <span
          aria-hidden="true"
          className={
            hasUserRelationship
              ? "text-muted-foreground"
              : "text-primary-foreground"
          }
        >
          ▾
        </span>
      </button>

      {isOpen ? (
        <div className="absolute left-0 z-40 mt-2 w-72 rounded-2xl border border-border bg-card p-2 shadow-xl">
          <div className="px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              My tune status
            </p>

            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              This changes your own Practice or Known status. It does not change
              the shared setlist.
            </p>
          </div>

          {!isAlreadyInPractice ? (
            <form
              action={startLearning}
              onSubmit={(event) => {
                if (!isKnown) return

                const confirmed = window.confirm(
                  `Move "${title}" from Known into Practice? This removes its Known-only status and starts the review schedule.`
                )

                if (!confirmed) {
                  event.preventDefault()
                }
              }}
            >
              <input type="hidden" name="piece_id" value={item.piece_id} />
              <input type="hidden" name="redirect_to" value={redirectTo} />
              <SubmitButton
                label="Start Practice"
                pendingLabel="Starting..."
                className={buttonStyles.menuItem}
              />
            </form>
          ) : null}

          {!isKnown ? (
            <form
              action={markAsKnown}
              onSubmit={(event) => {
                if (!isAlreadyInPractice) return

                const confirmed = window.confirm(
                  `Mark "${title}" as known? This removes it from active practice.`
                )

                if (!confirmed) {
                  event.preventDefault()
                }
              }}
            >
              <input type="hidden" name="piece_id" value={item.piece_id} />
              <input type="hidden" name="redirect_to" value={redirectTo} />
              <SubmitButton
                label={isAlreadyInPractice ? "Set as known" : "Mark as known"}
                pendingLabel="Saving..."
                className={buttonStyles.menuItem}
              />
            </form>
          ) : null}

          {isAlreadyInPractice && currentUserCoverage?.user_piece_id ? (
            <form
              action={removeFromPractice}
              onSubmit={(event) => {
                const confirmed = window.confirm(
                  `Remove "${title}" from active practice? This stops review scheduling for this tune, but does not remove it from the setlist.`
                )

                if (!confirmed) {
                  event.preventDefault()
                }
              }}
            >
              <input
                type="hidden"
                name="user_piece_id"
                value={currentUserCoverage.user_piece_id}
              />
              <input type="hidden" name="redirect_to" value={redirectTo} />
              <SubmitButton
                label="Remove from practice"
                pendingLabel="Removing..."
                className={buttonStyles.menuItem}
              />
            </form>
          ) : null}

          <button
            type="button"
            onClick={onClose}
            className="mt-2 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          >
            Close menu
          </button>
        </div>
      ) : null}
    </div>
  )
}

function MemberCoverageCard({
  member,
  coverage,
}: {
  member: SetlistMember
  coverage:
    | {
        status: "known" | "practice" | "gap"
        stage: number | null
      }
    | undefined
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 text-sm font-medium ${coverageClass(
        coverage
      )}`}
    >
      <p>
        {member.profile?.username ? (
          <UserIdentityLink
            username={member.profile.username}
            displayName={member.profile.display_name}
            fallbackLabel="Unknown"
            className="underline underline-offset-4 transition hover:text-primary"
          />
        ) : (
          memberLabel(member)
        )}
      </p>
      <p className="mt-1 text-xs opacity-85">{coverageLabel(coverage)}</p>
    </div>
  )
}

export default function SetlistTuneMatrix({
  currentUserId,
  members,
  items,
  canEdit,
  redirectTo,
  startLearning,
  markAsKnown,
  removeFromPractice,
  moveSetlistItem,
  removeTuneFromSetlist,
  updateSetlistItem,
}: SetlistTuneMatrixProps) {
  const [openStatusItemId, setOpenStatusItemId] = useState<number | null>(null)

  useEffect(() => {
    if (openStatusItemId === null) return

    function handlePointerDown(event: MouseEvent) {
      const target = event.target

      if (!(target instanceof Element)) return

      if (!target.closest("[data-setlist-status-dropdown-root]")) {
        setOpenStatusItemId(null)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenStatusItemId(null)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [openStatusItemId])

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const piece = item.piece
        const title = piece?.title ?? "Unknown tune"
        const displayKey = item.performance_key || piece?.key || "No key"
        const hasKeyOverride = Boolean(item.performance_key && piece?.key)
        const currentUserCoverage = item.coverage.find(
          (row) => row.user_id === currentUserId
        )
        const isStatusOpen = openStatusItemId === item.id

        return (
          <article
            key={item.id}
            className="rounded-2xl border border-border bg-background/70 p-4 shadow-sm"
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
                    {index + 1}
                  </span>

                  <Link
                    href={`/library/${item.piece_id}`}
                    className="font-serif text-2xl font-bold tracking-tight text-foreground underline decoration-transparent underline-offset-4 transition hover:text-primary hover:decoration-primary focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                  >
                    {title}
                  </Link>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <span>Key: {displayKey}</span>

                  {hasKeyOverride ? <span>Default: {piece?.key}</span> : null}

                  {piece?.style ? <span>Style: {piece.style}</span> : null}

                  {piece?.time_signature ? (
                    <span>Time: {piece.time_signature}</span>
                  ) : null}
                </div>

                <div className="mt-4">
                  <MyStatusDropdown
                    item={item}
                    currentUserCoverage={currentUserCoverage}
                    isOpen={isStatusOpen}
                    redirectTo={redirectTo}
                    onToggle={() =>
                      setOpenStatusItemId(isStatusOpen ? null : item.id)
                    }
                    onClose={() => setOpenStatusItemId(null)}
                    startLearning={startLearning}
                    markAsKnown={markAsKnown}
                    removeFromPractice={removeFromPractice}
                  />
                </div>

                {item.notes ? (
                  <p className="mt-3 rounded-xl border border-border bg-card p-3 text-sm leading-6 text-foreground">
                    {item.notes}
                  </p>
                ) : null}

                {item.chart_url ? (
                  <a
                    href={item.chart_url}
                    target="_blank"
                    rel="noreferrer"
                    className={buttonStyles.secondary}
                  >
                    {item.chart_label || item.chart_type || "Open chart/music"}
                  </a>
                ) : null}
              </div>

              {canEdit ? (
                <div className="flex flex-wrap gap-2 xl:justify-end">
                  <form action={moveSetlistItem}>
                    <input
                      type="hidden"
                      name="setlist_id"
                      value={item.setlist_id}
                    />
                    <input
                      type="hidden"
                      name="setlist_item_id"
                      value={item.id}
                    />
                    <input type="hidden" name="direction" value="up" />
                    <input type="hidden" name="redirect_to" value={redirectTo} />
                    <SubmitButton
                      label="↑"
                      pendingLabel="..."
                      className={buttonStyles.secondary}
                    />
                  </form>

                  <form action={moveSetlistItem}>
                    <input
                      type="hidden"
                      name="setlist_id"
                      value={item.setlist_id}
                    />
                    <input
                      type="hidden"
                      name="setlist_item_id"
                      value={item.id}
                    />
                    <input type="hidden" name="direction" value="down" />
                    <input type="hidden" name="redirect_to" value={redirectTo} />
                    <SubmitButton
                      label="↓"
                      pendingLabel="..."
                      className={buttonStyles.secondary}
                    />
                  </form>

                  <EditSetlistItemModal
                    item={item}
                    redirectTo={redirectTo}
                    updateSetlistItem={updateSetlistItem}
                  />

                  <form
                    action={removeTuneFromSetlist}
                    onSubmit={(event) => {
                      const confirmed = window.confirm(
                        `Remove "${title}" from this setlist?`
                      )

                      if (!confirmed) {
                        event.preventDefault()
                      }
                    }}
                  >
                    <input
                      type="hidden"
                      name="setlist_id"
                      value={item.setlist_id}
                    />
                    <input
                      type="hidden"
                      name="setlist_item_id"
                      value={item.id}
                    />
                    <input type="hidden" name="redirect_to" value={redirectTo} />
                    <SubmitButton
                      label="Remove"
                      pendingLabel="Removing..."
                      className={buttonStyles.destructiveSecondary}
                    />
                  </form>
                </div>
              ) : null}
            </div>

            <div className="mt-5 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
              {members.map((member) => {
                const coverage = item.coverage.find(
                  (row) => row.user_id === member.user_id
                )

                return (
                  <MemberCoverageCard
                    key={member.user_id}
                    member={member}
                    coverage={coverage}
                  />
                )
              })}
            </div>
          </article>
        )
      })}
    </div>
  )
}
