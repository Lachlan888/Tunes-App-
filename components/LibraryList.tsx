type Piece = {
  id: number
  title: string
  key: string | null
  style: string | null
  time_signature: string | null
}

type LibraryListProps = {
  pieces: Piece[] | null
}

export default function LibraryList({ pieces }: LibraryListProps) {
  if (!pieces || pieces.length === 0) {
    return <p className="text-gray-600">No tunes match this filter.</p>
  }

  return (
    <ul className="list-disc pl-6">
      {pieces.map((piece: Piece) => (
        <li key={piece.id}>
          {piece.title}
          {piece.key ? `, key ${piece.key}` : ""}
          {piece.style ? `, ${piece.style}` : ""}
          {piece.time_signature ? `, ${piece.time_signature}` : ""}
        </li>
      ))}
    </ul>
  )
}