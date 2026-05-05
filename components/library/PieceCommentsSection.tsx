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

export default function PieceCommentsSection({
  pieceId,
  comments,
  profileMap,
  currentUserId,
}: PieceCommentsSectionProps) {
  return (
    <div>
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Comments
        </h2>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Conversation about this tune. Comments are social and may appear in
          friends’ activity feeds.
        </p>
      </div>

      <form action={addPieceComment} className="mt-5 space-y-3">
        <input type="hidden" name="piece_id" value={pieceId} />
        <input type="hidden" name="redirect_to" value={`/library/${pieceId}`} />

        <textarea
          name="body"
          rows={5}
          placeholder="Ask a question, add a playing note, or continue the conversation"
          className={inputClassName}
          required
        />

        <SubmitButton
          label="Post comment"
          pendingLabel="Posting..."
          className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
        />
      </form>

      {comments.length > 0 ? (
        <ul className="mt-6 space-y-3">
          {comments.map((comment) => {
            const author = profileMap[comment.user_id] ?? {
              displayName: "Unknown user",
              username: null,
            }

            const isOwnComment = comment.user_id === currentUserId

            return (
              <li
                key={comment.id}
                className="rounded-2xl border border-border bg-background/70 p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
                    {comment.body}
                  </p>

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

                <p className="mt-3 text-sm text-muted-foreground">
                  Posted by{" "}
                  {author.username ? (
                    <Link
                      href={`/users/${author.username}`}
                      className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                    >
                      {author.displayName}
                    </Link>
                  ) : (
                    author.displayName
                  )}
                </p>
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