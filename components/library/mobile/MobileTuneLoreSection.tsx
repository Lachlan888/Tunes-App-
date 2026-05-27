"use client"

import Link from "next/link"
import { useState } from "react"
import SubmitButton from "@/components/SubmitButton"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import {
  addPieceComment,
  deletePieceComment,
  reportPieceComment,
} from "@/lib/actions/piece-comments"
import {
  addPieceLoreEntry,
  deletePieceLoreEntry,
  reportPieceLoreEntry,
  updatePieceLoreEntry,
} from "@/lib/actions/piece-lore"
import type {
  CommentAuthor,
  PieceCommentRow,
  PieceLoreEntryRow,
} from "@/lib/loaders/tune-detail"
import type { UserRole } from "@/lib/types"

type MobileTuneLoreSectionProps = {
  pieceId: number
  loreEntries: PieceLoreEntryRow[]
  comments: PieceCommentRow[]
  profileMap: Record<string, CommentAuthor>
  currentUserId: string
  currentUserRole: UserRole
  showLore: boolean
  showComments: boolean
}

type LoreCategory = PieceLoreEntryRow["category"]

type LoreModalMode =
  | {
      type: "edit"
      entry: PieceLoreEntryRow
    }
  | {
      type: "report"
      entry: PieceLoreEntryRow
    }
  | null

const LORE_CATEGORY_OPTIONS: {
  value: LoreCategory
  label: string
}[] = [
  { value: "region", label: "Region" },
  { value: "informant", label: "Source" },
  { value: "collector", label: "Collector" },
  { value: "alternate_title", label: "Alternate title" },
  { value: "tune_family", label: "Tune family" },
  { value: "story_folklore_note", label: "Story / folklore note" },
]

const LORE_CATEGORY_LABELS: Record<LoreCategory, string> = {
  region: "Region",
  informant: "Sources",
  collector: "Collectors",
  alternate_title: "Alternate titles",
  tune_family: "Tune family",
  story_folklore_note: "Story / folklore notes",
}

const inputClassName =
  "w-full min-w-0 rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"

function canUseModeratorTools(role: UserRole) {
  return role === "moderator" || role === "admin"
}

function groupLoreEntries(entries: PieceLoreEntryRow[]) {
  return LORE_CATEGORY_OPTIONS.map((category) => ({
    category: category.value,
    label: LORE_CATEGORY_LABELS[category.value],
    entries: entries.filter((entry) => entry.category === category.value),
  })).filter((group) => group.entries.length > 0)
}

function MobileSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="min-w-0 border-b border-border pb-6 last:border-b-0 last:pb-0">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </h2>
      <div className="mt-4 min-w-0">{children}</div>
    </section>
  )
}

function AuthorLink({ author }: { author: CommentAuthor }) {
  if (!author.username) {
    return <>{author.displayName}</>
  }

  return (
    <Link
      href={`/users/${encodeURIComponent(author.username)}`}
      className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
    >
      {author.displayName}
    </Link>
  )
}

function ModalShell({
  title,
  children,
  onClose,
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/35 px-3 py-3 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-3xl border border-border bg-card p-4 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <h3 className="break-words font-serif text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h3>
          <button type="button" onClick={onClose} className={buttonStyles.modalClose}>
            Close
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  )
}

function CommentForm({
  pieceId,
  parentCommentId,
  label,
  pendingLabel,
  placeholder,
}: {
  pieceId: number
  parentCommentId?: number
  label: string
  pendingLabel: string
  placeholder: string
}) {
  return (
    <form action={addPieceComment} className="space-y-3">
      <input type="hidden" name="piece_id" value={pieceId} />
      <input type="hidden" name="redirect_to" value={`/library/${pieceId}`} />

      {parentCommentId ? (
        <input type="hidden" name="parent_comment_id" value={parentCommentId} />
      ) : null}

      <textarea
        name="body"
        rows={parentCommentId ? 3 : 4}
        placeholder={placeholder}
        className={inputClassName}
        required
      />

      <SubmitButton
        label={label}
        pendingLabel={pendingLabel}
        className={joinClasses(buttonStyles.primary, "w-full")}
      />
    </form>
  )
}

function ReportCommentForm({
  pieceId,
  commentId,
}: {
  pieceId: number
  commentId: number
}) {
  return (
    <details className="mt-3">
      <summary className="cursor-pointer list-none text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground">
        Report
      </summary>

      <form action={reportPieceComment} className="mt-3 space-y-3">
        <input type="hidden" name="piece_id" value={pieceId} />
        <input type="hidden" name="comment_id" value={commentId} />
        <input type="hidden" name="redirect_to" value={`/library/${pieceId}`} />

        <select name="reason" className={inputClassName} required>
          <option value="">Choose a reason</option>
          <option value="spam">Spam</option>
          <option value="abuse_or_harassment">Abuse or harassment</option>
          <option value="hateful_content">Hateful content</option>
          <option value="sexual_content">Sexual content</option>
          <option value="misleading_or_bad_faith">
            Misleading or bad-faith
          </option>
          <option value="other">Other</option>
        </select>

        <textarea
          name="details"
          rows={3}
          placeholder="Optional details for moderators"
          className={inputClassName}
        />

        <SubmitButton
          label="Submit report"
          pendingLabel="Reporting..."
          className={joinClasses(buttonStyles.secondary, "w-full")}
        />
      </form>
    </details>
  )
}

function DeleteCommentForm({
  pieceId,
  commentId,
}: {
  pieceId: number
  commentId: number
}) {
  return (
    <form
      action={deletePieceComment}
      onSubmit={(event) => {
        const confirmed = window.confirm("Delete this comment?")
        if (!confirmed) event.preventDefault()
      }}
    >
      <input type="hidden" name="piece_id" value={pieceId} />
      <input type="hidden" name="redirect_to" value={`/library/${pieceId}`} />
      <input type="hidden" name="comment_id" value={commentId} />

      <SubmitButton
        label="Delete"
        pendingLabel="Deleting..."
        className={buttonStyles.destructiveSecondary}
      />
    </form>
  )
}

export default function MobileTuneLoreSection({
  pieceId,
  loreEntries,
  comments,
  profileMap,
  currentUserId,
  currentUserRole,
  showLore,
  showComments,
}: MobileTuneLoreSectionProps) {
  const [modalMode, setModalMode] = useState<LoreModalMode>(null)
  const groupedLoreEntries = groupLoreEntries(loreEntries)
  const isModerator = canUseModeratorTools(currentUserRole)
  const parentComments = comments.filter(
    (comment) => comment.parent_comment_id === null
  )
  const repliesByParentId = comments.reduce<Record<number, PieceCommentRow[]>>(
    (acc, comment) => {
      if (comment.parent_comment_id === null) return acc
      acc[comment.parent_comment_id] = [
        ...(acc[comment.parent_comment_id] ?? []),
        comment,
      ]
      return acc
    },
    {}
  )

  if (!showLore && !showComments) {
    return (
      <p className="text-sm leading-6 text-muted-foreground">
        Lore and comment sections are hidden in Tune Page Options.
      </p>
    )
  }

  return (
    <div className="min-w-0 space-y-6">
      {showLore ? (
        <MobileSection title="Sources & lore">
          <form action={addPieceLoreEntry} className="space-y-3">
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
              className={joinClasses(buttonStyles.primary, "w-full")}
            />
          </form>

          {groupedLoreEntries.length > 0 ? (
            <div className="mt-6 space-y-6">
              {groupedLoreEntries.map((group) => (
                <section key={group.category}>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {group.label}
                  </h3>

                  <ul className="mt-2 divide-y divide-border">
                    {group.entries.map((entry) => {
                      const author = profileMap[entry.user_id] ?? {
                        displayName: "Unknown user",
                        username: null,
                      }
                      const isOwnEntry = entry.user_id === currentUserId
                      const canDeleteEntry = isOwnEntry || isModerator

                      return (
                        <li key={entry.id} className="py-4 first:pt-0 last:pb-0">
                          <p className="whitespace-pre-wrap break-words text-sm leading-6 text-foreground">
                            {entry.entry_text}
                          </p>

                          <p className="mt-2 text-sm text-muted-foreground">
                            Added by <AuthorLink author={author} />
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {isModerator ? (
                              <button
                                type="button"
                                onClick={() => setModalMode({ type: "edit", entry })}
                                className={buttonStyles.secondary}
                              >
                                Edit
                              </button>
                            ) : null}

                            {!isOwnEntry && !isModerator ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setModalMode({ type: "report", entry })
                                }
                                className={buttonStyles.secondary}
                              >
                                Report
                              </button>
                            ) : null}

                            {canDeleteEntry ? (
                              <form
                                action={deletePieceLoreEntry}
                                onSubmit={(event) => {
                                  const confirmed =
                                    window.confirm("Delete this lore entry?")
                                  if (!confirmed) event.preventDefault()
                                }}
                              >
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
                                  className={buttonStyles.destructiveSecondary}
                                />
                              </form>
                            ) : null}
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              No sources or lore yet.
            </p>
          )}
        </MobileSection>
      ) : null}

      {showComments ? (
        <MobileSection title="Comments">
          <CommentForm
            pieceId={pieceId}
            label="Post comment"
            pendingLabel="Posting..."
            placeholder="Ask a question, add a playing note, or continue the conversation"
          />

          {parentComments.length > 0 ? (
            <ul className="mt-6 divide-y divide-border">
              {parentComments.map((comment) => {
                const author = profileMap[comment.user_id] ?? {
                  displayName: "Unknown user",
                  username: null,
                }
                const isOwnComment = comment.user_id === currentUserId
                const replies = repliesByParentId[comment.id] ?? []
                const isHidden = comment.moderation_status === "hidden"

                return (
                  <li key={comment.id} className="py-5 first:pt-0 last:pb-0">
                    {isHidden ? (
                      <p className="text-sm font-medium text-destructive">
                        This comment has been hidden by a moderator.
                      </p>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-foreground">
                              {comment.body}
                            </p>

                            <p className="mt-2 text-sm text-muted-foreground">
                              Posted by <AuthorLink author={author} />
                            </p>
                          </div>

                          {isOwnComment ? (
                            <DeleteCommentForm
                              pieceId={pieceId}
                              commentId={comment.id}
                            />
                          ) : null}
                        </div>

                        {!isOwnComment ? (
                          <ReportCommentForm
                            pieceId={pieceId}
                            commentId={comment.id}
                          />
                        ) : null}
                      </>
                    )}

                    {replies.length > 0 ? (
                      <div className="mt-4 space-y-4 border-l-2 border-border pl-4">
                        {replies.map((reply) => {
                          const replyAuthor = profileMap[reply.user_id] ?? {
                            displayName: "Unknown user",
                            username: null,
                          }
                          const isOwnReply = reply.user_id === currentUserId
                          const replyIsHidden =
                            reply.moderation_status === "hidden"

                          return (
                            <div key={reply.id}>
                              {replyIsHidden ? (
                                <p className="text-sm font-medium text-destructive">
                                  This reply has been hidden by a moderator.
                                </p>
                              ) : (
                                <>
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <p className="whitespace-pre-wrap break-words text-sm leading-6 text-foreground">
                                        {reply.body}
                                      </p>

                                      <p className="mt-2 text-xs text-muted-foreground">
                                        Reply from{" "}
                                        <AuthorLink author={replyAuthor} />
                                      </p>
                                    </div>

                                    {isOwnReply ? (
                                      <DeleteCommentForm
                                        pieceId={pieceId}
                                        commentId={reply.id}
                                      />
                                    ) : null}
                                  </div>

                                  {!isOwnReply ? (
                                    <ReportCommentForm
                                      pieceId={pieceId}
                                      commentId={reply.id}
                                    />
                                  ) : null}
                                </>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ) : null}

                    {!isHidden ? (
                      <div className="mt-4">
                        <CommentForm
                          pieceId={pieceId}
                          parentCommentId={comment.id}
                          label="Reply"
                          pendingLabel="Replying..."
                          placeholder="Reply to this comment"
                        />
                      </div>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              No comments yet.
            </p>
          )}
        </MobileSection>
      ) : null}

      {modalMode?.type === "edit" ? (
        <ModalShell title="Edit lore entry" onClose={() => setModalMode(null)}>
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

            <SubmitButton
              label="Save lore entry"
              pendingLabel="Saving..."
              className={joinClasses(buttonStyles.primary, "w-full")}
            />
          </form>
        </ModalShell>
      ) : null}

      {modalMode?.type === "report" ? (
        <ModalShell title="Report lore entry" onClose={() => setModalMode(null)}>
          <form action={reportPieceLoreEntry} className="space-y-3">
            <input type="hidden" name="piece_id" value={pieceId} />
            <input type="hidden" name="redirect_to" value={`/library/${pieceId}`} />
            <input
              type="hidden"
              name="lore_entry_id"
              value={modalMode.entry.id}
            />

            <select name="reason" className={inputClassName} required>
              <option value="">Choose a reason</option>
              <option value="spam">Spam</option>
              <option value="abuse_or_harassment">Abuse or harassment</option>
              <option value="hateful_content">Hateful content</option>
              <option value="sexual_content">Sexual content</option>
              <option value="misleading_or_bad_faith">
                Misleading or bad-faith
              </option>
              <option value="other">Other</option>
            </select>

            <textarea
              name="details"
              rows={4}
              placeholder="Optional details for moderators"
              className={inputClassName}
            />

            <SubmitButton
              label="Submit report"
              pendingLabel="Reporting..."
              className={joinClasses(buttonStyles.primary, "w-full")}
            />
          </form>
        </ModalShell>
      ) : null}
    </div>
  )
}
