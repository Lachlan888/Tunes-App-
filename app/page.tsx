import { supabase } from '@/lib/supabase'

type Piece = {
  id: number
  title: string | null
  key: string | null
  style: string | null
  time_signature: string | null
}

type LearningListItem = {
  id: number
  position: number | null
  pieces: Piece | Piece[] | null
}

type LearningList = {
  id: number
  name: string
  description: string | null
  learning_list_items: LearningListItem[] | null
}

export default async function Home() {
  const { data: learningListsData, error: learningListsError } = await supabase
    .from('learning_lists')
    .select(`
      id,
      name,
      description,
      learning_list_items (
        id,
        position,
        pieces (
          id,
          title,
          key,
          style,
          time_signature
        )
      )
    `)
    .order('id', { ascending: true })

  const { data: piecesData, error: piecesError } = await supabase
    .from('pieces')
    .select(`
      id,
      title,
      key,
      style,
      time_signature
    `)
    .order('title', { ascending: true })

  if (learningListsError) {
    return <pre>{JSON.stringify(learningListsError, null, 2)}</pre>
  }

  if (piecesError) {
    return <pre>{JSON.stringify(piecesError, null, 2)}</pre>
  }

  const lists = (learningListsData ?? []) as unknown as LearningList[]
  const pieces = (piecesData ?? []) as Piece[]

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Tunes App</h1>

      <section style={{ marginBottom: '3rem' }}>
        <h2>Learning Lists</h2>

        {lists.length === 0 ? (
          <p>No learning lists found.</p>
        ) : (
          lists.map((list) => (
            <section key={list.id} style={{ marginBottom: '2rem' }}>
              <h3>{list.name}</h3>
              {list.description && <p>{list.description}</p>}

              {!list.learning_list_items || list.learning_list_items.length === 0 ? (
                <p>No tunes in this list yet.</p>
              ) : (
                <ul>
                  {[...list.learning_list_items]
                    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                    .map((item) => {
                      const piece = Array.isArray(item.pieces)
                        ? item.pieces[0]
                        : item.pieces

                      return (
                        <li key={item.id}>
                          {piece?.title ?? 'Untitled piece'}
                          {piece?.key ? `, key ${piece.key}` : ''}
                          {piece?.style ? `, ${piece.style}` : ''}
                          {piece?.time_signature ? `, ${piece.time_signature}` : ''}
                        </li>
                      )
                    })}
                </ul>
              )}
            </section>
          ))
        )}
      </section>

      <section>
        <h2>All Tunes</h2>

        {pieces.length === 0 ? (
          <p>No tunes found.</p>
        ) : (
          <ul>
            {pieces.map((piece) => (
              <li key={piece.id}>
                {piece.title ?? 'Untitled piece'}
                {piece.key ? `, key ${piece.key}` : ''}
                {piece.style ? `, ${piece.style}` : ''}
                {piece.time_signature ? `, ${piece.time_signature}` : ''}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}