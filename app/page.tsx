import { supabase } from '@/lib/supabase'

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

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Learning Lists</h1>

      {!data || data.length === 0 ? (
        <p>No learning lists found.</p>
      ) : (
        data.map((list) => (
          <section key={list.id} style={{ marginBottom: '2rem' }}>
            <h2>{list.name}</h2>
            {list.description && <p>{list.description}</p>}

            {!list.learning_list_items || list.learning_list_items.length === 0 ? (
              <p>No tunes in this list yet.</p>
            ) : (
              <ul>
                {[...list.learning_list_items]
                  .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                  .map((item) => (
                    <li key={item.id}>
                      {item.pieces?.title ?? 'Untitled piece'}
                      {item.pieces?.key ? `, key ${item.pieces.key}` : ''}
                      {item.pieces?.style ? `, ${item.pieces.style}` : ''}
                      {item.pieces?.time_signature
                        ? `, ${item.pieces.time_signature}`
                        : ''}
                    </li>
                  ))}
              </ul>
            )}
          </section>
        ))
      )}
    </main>
  )
}