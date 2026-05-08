"use client"

import Link from "next/link"
import { useState } from "react"
import SubmitButton from "@/components/SubmitButton"
import {
  addPieceLoreEntry,
  deletePieceLoreEntry,
  reportPieceLoreEntry,
  updatePieceLoreEntry,
} from "@/lib/actions/piece-lore"
import type { UserRole } from "@/lib/types"

export type PieceLoreCategory =
  | "region"
  | "informant"
  | "collector"
  | "alternate_title"
  | "tune_family"
  | "story_folklore_note"

export type PieceLoreEntry = {
  id: number
  category: PieceLoreCategory
  entry_text: string
  created_at: string
  user_id: string
}

type LoreAuthor = {
  displayName: string
  username: string | null
}

type PieceLoreSectionProps = {
  pieceId: number
  loreEntries: PieceLoreEntry[]
  profileMap: Record<string, LoreAuthor>
  currentUserId: string
  currentUserRole: UserRole
}

type LoreModalMode =
  | {
      type: "edit"
      entry: PieceLoreEntry
    }
  | {
      type: "report"
      entry: PieceLoreEntry
    }
  | null

const LORE_CATEGORY_OPTIONS: {
  value: PieceLoreCategory
  label: string
}[] = [
  { value: "region", label: "Region" },
  { value: "informant", label: "Source" },
  { value: "collector", label: "Collector" },
  { value: "alternate_title", label: "Alternate title" },
  { value: "tune_family", label: "Tune family" },
  { value: "story_folklore_note", label: "Story / folklore note" },
]

const LORE_CATEGORY_LABELS: Record<PieceLoreCategory, string> = {
  region: "Region",
  informant: "Sources",
  collector: "Collectors",
  alternate_title: "Alternate titles",
  tune_family: "Tune family",
  story_folklore_note: "Story / folklore notes",
}

const inputClassName =
  "w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"

const primaryButtonClass =
  "rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"

const dangerButtonClass =
  "rounded-full border border-destructive bg-background/70 px-3 py-1 text-xs font-medium text-destructive shadow-sm transition hover:bg-destructive hover:text-destructive-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"

const secondaryButtonClass =
  "rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"

function canUseModeratorTools(role: UserRole) {
  return role === "moderator" || role === "admin"
}

function groupLoreEntries(entries: PieceLoreEntry[]) {
  return LORE_CATEGORY_OPTIONS.map((category) => ({
    category: category.value,
    label: LORE_CATEGORY_LABELS[category.value],
    entries: entries.filter((entry) => entry.category === category.value),
  })).filter((group) => group.entries.length > 0)
}

function ModalShell({
  title,
  description,
  children,
  onClose,
}: {
  title: string
  description: string
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/35 px-4 py-8 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Sources &amp; Lore
            </p>
            <h3 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground">
              {title}
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border bg-background/70 px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          >
            Close
          </button>
        </div>

        <div className="mt-6">{children}</div>
      </div>
    </div>
  )
}

function AuthorLink({ author }: { author: LoreAuthor }) {
  if (!author.username) {
    return <>{author.displayName}</>
  }

  return (
    <Link
      href={`/users/${author.username}`}
      className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
    >
      {author.displayName}
    </Link>
  )
}

export default function PieceLoreSection({
  pieceId,
  loreEntries,
  profileMap,
  currentUserId,
  currentUserRole,
}: PieceLoreSectionProps) {
  const [modalMode, setModalMode] = useState<LoreModalMode>(null)
  const groupedLoreEntries = groupLoreEntries(loreEntries)
  const isModerator = canUseModeratorTools(currentUserRole)

  return (
    <div>
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Sources &amp; Lore
        </h3>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Add shared background, source notes, alternate titles, regional notes,
          tune-family links, or folklore.
        </p>
      </div>

      <form action={addPieceLoreEntry} className="mt-5 space-y-3">
        <input type="hidden" name="piece_id" value={pieceId} />
        <input type="hidden" name="redirect_to" value={`/library/${pieceId}`} />

        <select name="category" className={inputClassName} required>
          {LORE_CATEGORY_OPTIONS.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>

        <textarea
          name="entry_text"
          rows={4}
          placeholder="Add a source, alternate title, regional note, tune-family link, or bit of folklore"
          className={inputClassName}
          required
        />

        <SubmitButton
          label="Add lore entry"
          pendingLabel="Adding..."
          className={primaryButtonClass}
        />
      </form>

      {groupedLoreEntries.length > 0 ? (
        <div className="mt-8 space-y-7">
          {groupedLoreEntries.map((group) => (
            <section key={group.category}>
              <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {group.label}
              </h4>

              <ul className="mt-3 space-y-3">
                {group.entries.map((entry) => {
                  const author = profileMap[entry.user_id] ?? {
                    displayName: "Unknown user",
                    username: null,
                  }

                  const isOwnEntry = entry.user_id === currentUserId
                  const canDeleteEntry = isOwnEntry || isModerator

                  return (
                    <li
                      key={entry.id}
                      className="rounded-2xl border border-border bg-background/70 p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="whitespace-pre-wrap break-words text-sm leading-6 text-foreground">
                            {entry.entry_text}
                          </p>

                          <p className="mt-3 text-sm text-muted-foreground">
                            Added by <AuthorLink author={author} />
                          </p>
                        </div>

                        <div className="flex flex-shrink-0 flex-wrap justify-end gap-2">
                          {isModerator ? (
                            <button
                              type="button"
                              onClick={() =>
                                setModalMode({
                                  type: "edit",
                                  entry,
                                })
                              }
                              className={secondaryButtonClass}
                            >
                              Edit
                            </button>
                          ) : null}

                          {!isOwnEntry && !isModerator ? (
                            <button
                              type="button"
                              onClick={() =>
                                setModalMode({
                                  type: "report",
                                  entry,
                                })
                              }
                              className={secondaryButtonClass}
                            >
                              Report
                            </button>
                          ) : null}

                          {canDeleteEntry ? (
                            <form action={deletePieceLoreEntry}>
                              <input
                                type="hidden"
                                name="piece_id"
                                value={pieceId}
                              />
                              <input
                                type="hidden"
                                name="redirect_to"
                                value={`/library/${pieceId}`}
                              />
                              <input
                                type="hidden"
                                name="lore_entry_id"
                                value={entry.id}
                              />

                              <SubmitButton
                                label="Delete"
                                pendingLabel="Deleting..."
                                className={dangerButtonClass}
                              />
                            </form>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
          No sources or lore yet.
        </p>
      )}

      {modalMode?.type === "edit" ? (
        <ModalShell
          title="Edit lore entry"
          description="Edit the existing lore entry. The current category and text are prefilled."
          onClose={() => setModalMode(null)}
        >
          <form action={updatePieceLoreEntry} className="space-y-3">
            <input type="hidden" name="piece_id" value={pieceId} />
            <input type="hidden" name="redirect_to" value={`/library/${pieceId}`} />
            <input
              type="hidden"
              name="lore_entry_id"
              value={modalMode.entry.id}
            />

            <select
              name="category"
              defaultValue={modalMode.entry.category}
              className={inputClassName}
              required
            >
              {LORE_CATEGORY_OPTIONS.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            <textarea
              name="entry_text"
              rows={6}
              defaultValue={modalMode.entry.entry_text}
              className={inputClassName}
              required
            />

            <textarea
              name="moderator_note"
              rows={3}
              placeholder="Optional moderator note"
              className={inputClassName}
            />

            <div className="grid gap-2 pt-2">
              <SubmitButton
                label="Save lore entry"
                pendingLabel="Saving..."
                className="w-full rounded-full border border-primary bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              />

              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="w-full rounded-full border border-border bg-background/70 px-4 py-3 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              >
                Cancel
              </button>
            </div>
          </form>
        </ModalShell>
      ) : null}

      {modalMode?.type === "report" ? (
        <ModalShell
          title="Report lore entry"
          description="Send this lore entry to moderators for review. Explain what seems wrong, duplicated, misleading, or inappropriate."
          onClose={() => setModalMode(null)}
        >
          <div className="mb-4 rounded-2xl border border-border bg-background/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Reported entry
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">
              {modalMode.entry.entry_text}
            </p>
          </div>

          <form action={reportPieceLoreEntry} className="space-y-3">
            <input type="hidden" name="piece_id" value={pieceId} />
            <input type="hidden" name="redirect_to" value={`/library/${pieceId}`} />
            <input
              type="hidden"
              name="lore_entry_id"
              value={modalMode.entry.id}
            />

            <select name="reason" defaultValue="" className={inputClassName} required>
              <option value="">Choose a reason</option>
              <option value="incorrect">Incorrect</option>
              <option value="duplicate">Duplicate</option>
              <option value="misleading">Misleading</option>
              <option value="inappropriate">Inappropriate</option>
              <option value="other">Other</option>
            </select>

            <textarea
              name="details"
              rows={5}
              placeholder="What should moderators look at?"
              className={inputClassName}
            />

            <div className="grid gap-2 pt-2">
              <SubmitButton
                label="Submit lore report"
                pendingLabel="Reporting..."
                className="w-full rounded-full border border-primary bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              />

              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="w-full rounded-full border border-border bg-background/70 px-4 py-3 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              >
                Cancel
              </button>
            </div>
          </form>
        </ModalShell>
      ) : null}
    </div>
  )
}