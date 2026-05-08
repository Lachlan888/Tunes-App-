import { redirect } from "next/navigation"
import {
  getCurrentUserRole,
  requireUserContext,
  type SupabaseServerClient,
} from "@/lib/auth/session"
import type { UserRole } from "@/lib/types"

export function canModerate(role: string | null | undefined) {
  return role === "moderator" || role === "admin"
}

export function canAdmin(role: string | null | undefined) {
  return role === "admin"
}

export { getCurrentUserRole }

export async function requireModerator(): Promise<{
  supabase: SupabaseServerClient
  user: {
    id: string
    email?: string | null
  }
  role: UserRole
}> {
  const context = await requireUserContext()

  if (!canModerate(context.role)) {
    redirect("/")
  }

  return {
    supabase: context.supabase,
    user: context.user,
    role: context.role,
  }
}