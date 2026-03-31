import Link from "next/link"
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
    <section className="mt-12">
      <h2 className="mb-4 text-xl font-semibold">Comments</h2>

      <form action={addPieceComment} className="mb-6 max-w-xl space-y-3">
        <input type="hidden" name="piece_id" value={pieceId} />
        <input type="hidden" name="redirect_to" value={`/library/${pieceId}`} />

        <textarea
          name="body"
          rows={4}
          placeholder="Leave a comment about this tune"
          className="w-full border p-3"
          required
        />

        <button type="submit" className="border px-4 py-2">
          Post comment
        </button>
      </form>

      {comments.length > 0 ? (
        <ul className="space-y-4">
          {comments.map((comment) => {
            const author = profileMap[comment.user_id] ?? {
              displayName: "Unknown user",
              username: null,
            }

            return (
              <li key={comment.id} className="border p-3">
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