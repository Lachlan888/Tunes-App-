import { supabase } from '@/lib/supabase'

export default async function Home() {
  const { data, error } = await supabase.from('pieces').select('*')

  if (error) {
    return <pre>{JSON.stringify(error, null, 2)}</pre>
  }

  return <pre>{JSON.stringify(data, null, 2)}</pre>
}