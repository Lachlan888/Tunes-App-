import Link from "next/link"
import SubmitButton from "@/components/SubmitButton"
import { buttonStyles } from "@/components/ui/buttonStyles"
import {
  addPieceComment,
  deletePieceComment,
  reportPieceComment,
} from "@/lib/actions/piece-comments"

type PieceComment = {
  id: number
  body: string
  created_at: string
  user_id: string
  parent_comment_id: number | null
  moderation_status: "visible" | "hidden"
}

type CommentAuthor = {
  displayName: string
  username: string | null
}

type PieceCommentsSectionProps = {
  pieceId: number
  comments: PieceComment[]
  profileMap: Record<string, CommentAuthor>
  currentUserId: string
}

const inputClassName =
  "w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"

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
        <input
          type="hidden"
          name="parent_comment_id"
          value={parentCommentId}
        />
      ) : null}

      <textarea
        name="body"
        rows={parentCommentId ? 3 : 5}
        placeholder={placeholder}
        className={inputClassName}
        required
      />

      <SubmitButton
        label={label}
        pendingLabel={pendingLabel}
        className={buttonStyles.primary}
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
    <details className="mt-3 rounded-2xl border border-border bg-background/70 p-3">
      <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground">
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
          className={buttonStyles.secondary}
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

export default function PieceCommentsSection({
  pieceId,
  comments,
  profileMap,
  currentUserId,
}: PieceCommentsSectionProps) {
  const parentComments = comments.filter(
    (comment) => comment.parent_comment_id === null
  )

  const repliesByParentId = comments.reduce<Record<number, PieceComment[]>>(
    (acc, comment) => {
      if (comment.parent_comment_id === null) {
        return acc
      }

      acc[comment.parent_comment_id] = [
        ...(acc[comment.parent_comment_id] ?? []),
        comment,
      ]

      return acc
    },
    {}
  )

  return (
    <div>
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Comments
        </h2>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Conversation about this tune. Replies stay attached to the tune, and
          may also appear in inbox notifications.
        </p>
      </div>

      <div className="mt-5">
        <CommentForm
          pieceId={pieceId}
          label="Post comment"
          pendingLabel="Posting..."
          placeholder="Ask a question, add a playing note, or continue the conversation"
        />
      </div>

      {parentComments.length > 0 ? (
        <ul className="mt-6 space-y-4">
          {parentComments.map((comment) => {
            const author = profileMap[comment.user_id] ?? {
              displayName: "Unknown user",
              username: null,
            }

            const isOwnComment = comment.user_id === currentUserId
            const replies = repliesByParentId[comment.id] ?? []
            const isHidden = comment.moderation_status === "hidden"

            return (
              <li
                key={comment.id}
                className="rounded-2xl border border-border bg-background/70 p-4 shadow-sm"
              >
                {isHidden ? (
                  <p className="rounded-2xl border border-destructive bg-muted p-3 text-sm font-medium text-destructive">
                    This comment has been hidden by a moderator.
                  </p>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
                          {comment.body}
                        </p>

                        <p className="mt-3 text-sm text-muted-foreground">
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

                {replies.length > 0 && (
                  <div className="mt-4 space-y-3 border-l-2 border-border pl-4">
                    {replies.map((reply) => {
                      const replyAuthor = profileMap[reply.user_id] ?? {
                        displayName: "Unknown user",
                        username: null,
                      }

                      const isOwnReply = reply.user_id === currentUserId
                      const replyIsHidden = reply.moderation_status === "hidden"

                      return (
                        <div
                          key={reply.id}
                          className="rounded-2xl border border-border bg-muted/70 p-3"
                        >
                          {replyIsHidden ? (
                            <p className="rounded-2xl border border-destructive bg-muted p-3 text-sm font-medium text-destructive">
                              This reply has been hidden by a moderator.
                            </p>
                          ) : (
                            <>
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
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
                )}

                {!isHidden ? (
                  <div className="mt-4 border-t border-border pt-4">
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
        <p className="mt-5 rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
          No comments yet.
        </p>
      )}
    </div>
  )
}