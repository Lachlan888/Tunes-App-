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
  const { data, error } = await supabase
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

  if (error) {
    return <pre>{JSON.stringify(error, null, 2)}</pre>
  }

  const lists = (data ?? []) as unknown as LearningList[]

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Learning Lists</h1>

      {lists.length === 0 ? (
        <p>No learning lists found.</p>
      ) : (
        lists.map((list) => (
          <section key={list.id} style={{ marginBottom: '2rem' }}>
            <h2>{list.name}</h2>
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
    </main>
  )
}