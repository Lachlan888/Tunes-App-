import Link from "next/link"
import SubmitButton from "@/components/SubmitButton"
import {
  addPieceComment,
  deletePieceComment,
} from "@/lib/actions/piece-comments"

type PieceComment = {
  id: number
  body: string
  created_at: string
  user_id: string
  parent_comment_id: number | null
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
      href={`/users/${author.username}`}
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
        className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
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

            return (
              <li
                key={comment.id}
                className="rounded-2xl border border-border bg-background/70 p-4 shadow-sm"
              >
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
                    <form action={deletePieceComment}>
                      <input type="hidden" name="piece_id" value={pieceId} />
                      <input
                        type="hidden"
                        name="redirect_to"
                        value={`/library/${pieceId}`}
                      />
                      <input
                        type="hidden"
                        name="comment_id"
                        value={comment.id}
                      />

                      <SubmitButton
                        label="Delete"
                        pendingLabel="Deleting..."
                        className="rounded-full border border-destructive bg-background/70 px-3 py-1 text-xs font-medium text-destructive shadow-sm transition hover:bg-destructive hover:text-destructive-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                      />
                    </form>
                  ) : null}
                </div>

                {replies.length > 0 && (
                  <div className="mt-4 space-y-3 border-l-2 border-border pl-4">
                    {replies.map((reply) => {
                      const replyAuthor = profileMap[reply.user_id] ?? {
                        displayName: "Unknown user",
                        username: null,
                      }

                      const isOwnReply = reply.user_id === currentUserId

                      return (
                        <div
                          key={reply.id}
                          className="rounded-2xl border border-border bg-muted/70 p-3"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
                                {reply.body}
                              </p>
                              <p className="mt-2 text-xs text-muted-foreground">
                                Reply from <AuthorLink author={replyAuthor} />
                              </p>
                            </div>

                            {isOwnReply ? (
                              <form action={deletePieceComment}>
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
                                  name="comment_id"
                                  value={reply.id}
                                />

                                <SubmitButton
                                  label="Delete"
                                  pendingLabel="Deleting..."
                                  className="rounded-full border border-destructive bg-background/70 px-3 py-1 text-xs font-medium text-destructive shadow-sm transition hover:bg-destructive hover:text-destructive-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                                />
                              </form>
                            ) : null}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                <div className="mt-4 border-t border-border pt-4">
                  <CommentForm
                    pieceId={pieceId}
                    parentCommentId={comment.id}
                    label="Reply"
                    pendingLabel="Replying..."
                    placeholder="Reply to this comment"
                  />
                </div>
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