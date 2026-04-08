import Link from "next/link"
import SubmitButton from "@/components/SubmitButton"
import { addPieceComment } from "@/lib/actions/piece-comments"

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
}

export default function PieceCommentsSection({
  pieceId,
  comments,
  profileMap,
}: PieceCommentsSectionProps) {
  return (
    <section className="mt-10">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Comments</h2>
          <p className="mt-1 text-sm text-gray-600">
            Notes, variants, or useful context from other players.
          </p>
        </div>
      </div>

      <form action={addPieceComment} className="mb-8 max-w-2xl space-y-3">
        <input type="hidden" name="piece_id" value={pieceId} />
        <input type="hidden" name="redirect_to" value={`/library/${pieceId}`} />

        <textarea
          name="body"
          rows={4}
          placeholder="Leave a comment about this tune"
          className="w-full rounded border p-3"
          required
        />

        <SubmitButton
          label="Post comment"
          pendingLabel="Posting..."
          className="border px-4 py-2 text-sm"
        />
      </form>

      {comments.length > 0 ? (
        <ul className="space-y-4">
          {comments.map((comment) => {
            const author = profileMap[comment.user_id] ?? {
              displayName: "Unknown user",
              username: null,
            }

            return (
              <li key={comment.id} className="rounded border p-4">
                <p className="mb-2 text-sm text-gray-600">
                  {author.username ? (
                    <Link
                      href={`/users/${author.username}`}
                      className="underline hover:no-underline"
                    >
                      {author.displayName}
                    </Link>
                  ) : (
                    author.displayName
                  )}
                </p>

                <p className="whitespace-pre-wrap text-gray-800">
                  {comment.body}
                </p>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-gray-700">No comments yet.</p>
      )}
    </section>
  )
}