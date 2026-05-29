import "server-only"

import { createClient as createSupabaseClient } from "@supabase/supabase-js"

let supabaseAdminClient:
  | ReturnType<typeof createSupabaseClient>
  | null = null

function getRequiredServerEnv(name: string) {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing required server environment variable: ${name}`)
  }

  return value
}

export function createAdminClient() {
  if (supabaseAdminClient) {
    return supabaseAdminClient
  }

  const supabaseUrl = getRequiredServerEnv("NEXT_PUBLIC_SUPABASE_URL")
  const serviceRoleKey = getRequiredServerEnv("SUPABASE_SERVICE_ROLE_KEY")

  supabaseAdminClient = createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return supabaseAdminClient
}

export async function getUserEmailForNotificationRecipient(userId: string) {
  const supabaseAdmin = createAdminClient()

  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId)

  if (error) {
    throw new Error(error.message)
  }

  return data.user?.email ?? null
}
