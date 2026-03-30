import { addPieceComment } from "@/lib/actions/piece-comments"

type PieceComment = {
  id: number
  body: string
  created_at: string
  user_id: string
}

type PieceCommentsSectionProps = {
  pieceId: number
  comments: PieceComment[]
  profileNameMap: Record<string, string>
}

export default function PieceCommentsSection({
  pieceId,
  comments,
  profileNameMap,
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
            const authorName = profileNameMap[comment.user_id] || "Unknown user"

            return (
              <li key={comment.id} className="border p-3">
                <p className="mb-2 text-sm text-gray-600">{authorName}</p>
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