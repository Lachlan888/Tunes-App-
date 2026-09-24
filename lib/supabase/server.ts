import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { measuredFetch } from "./measured-fetch"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      ...(process.env.NODE_ENV === "development" && process.env.TUNES_MEASURE_QUERIES === "1"
        ? { global: { fetch: measuredFetch(fetch, sample => console.info("[query-measurement]", JSON.stringify(sample))) } }
        : {}),
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
          }
        },
      },
    }
  )
}
