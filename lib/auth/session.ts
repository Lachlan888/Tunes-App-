import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { UserRole } from "@/lib/types"

export type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

export type CurrentUserProfileContext = {
  id: string
  username: string | null
  display_name: string | null
  role: UserRole
}

export type CurrentUserContext = {
  supabase: SupabaseServerClient
  user: {
    id: string
    email?: string | null
  }
  profile: CurrentUserProfileContext | null
  role: UserRole
}

function normaliseRole(role: string | null | undefined): UserRole {
  if (role === "moderator" || role === "admin") {
    return role
  }

  return "user"
}

export async function getOptionalUserContext(): Promise<CurrentUserContext | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, role")
    .eq("id", user.id)
    .maybeSingle()

  if (error) {
    console.error("Error loading current user profile context:", error)
  }

  const role = normaliseRole(profile?.role)

  return {
    supabase,
    user: {
      id: user.id,
      email: user.email ?? null,
    },
    profile: profile
      ? {
          id: profile.id,
          username: profile.username,
          display_name: profile.display_name,
          role,
        }
      : null,
    role,
  }
}

export async function requireUserContext(): Promise<CurrentUserContext> {
  const context = await getOptionalUserContext()

  if (!context) {
    redirect("/login")
  }

  return context
}

export async function getCurrentUserRole(
  supabase: SupabaseServerClient,
  userId: string
): Promise<UserRole> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle()

  if (error) {
    console.error("Error loading user role:", error)
    return "user"
  }

  return normaliseRole(data?.role)
}