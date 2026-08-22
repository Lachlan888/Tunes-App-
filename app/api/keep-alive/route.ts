import "server-only"

import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET

  return Boolean(
    secret && request.headers.get("authorization") === `Bearer ${secret}`
  )
}

function getRequiredServerEnv(name: string) {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing required server environment variable: ${name}`)
  }

  return value
}

function createKeepAliveClient() {
  const supabaseUrl = getRequiredServerEnv("NEXT_PUBLIC_SUPABASE_URL")
  const serviceRoleKey = getRequiredServerEnv("SUPABASE_SERVICE_ROLE_KEY")

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  })
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = createKeepAliveClient()

    for (let queryNumber = 1; queryNumber <= 3; queryNumber += 1) {
      const { error } = await supabase.from("pieces").select("id").limit(1)

      if (error) {
        throw new Error(`Keep-alive query ${queryNumber} failed: ${error.message}`)
      }
    }

    return NextResponse.json({ ok: true, queriesCompleted: 3 })
  } catch (error) {
    console.error("Supabase keep-alive route failed:", error)

    return NextResponse.json(
      { ok: false, error: "Supabase keep-alive failed." },
      { status: 500 }
    )
  }
}
