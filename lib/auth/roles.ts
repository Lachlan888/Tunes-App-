import { redirect } from "next/navigation"
import {
  getCurrentUserRole,
  requireUserContext,
  type SupabaseServerClient,
} from "@/lib/auth/session"
import type { AppAdminRole, UserRole } from "@/lib/types"

export function canModerate(role: string | null | undefined) {
  return role === "moderator" || role === "admin"
}

export function canAdmin(role: string | null | undefined) {
  return role === "admin"
}

export { getCurrentUserRole }

export async function isAppAdmin(
  supabase: SupabaseServerClient,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("app_admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle()

  if (error) {
    console.error("Error checking app admin status:", error)
    return false
  }

  return Boolean(data)
}

export async function getAppAdminRole(
  supabase: SupabaseServerClient,
  userId: string
): Promise<AppAdminRole | null> {
  const { data, error } = await supabase
    .from("app_admins")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle()

  if (error) {
    console.error("Error loading app admin role:", error)
    return null
  }

  if (data?.role === "owner" || data?.role === "admin") {
    return data.role
  }

  return null
}

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

export async function requireAppAdmin(): Promise<{
  supabase: SupabaseServerClient
  user: {
    id: string
    email?: string | null
  }
  adminRole: AppAdminRole
}> {
  const context = await requireUserContext()
  const adminRole = await getAppAdminRole(context.supabase, context.user.id)

  if (!adminRole) {
    redirect("/")
  }

  return {
    supabase: context.supabase,
    user: context.user,
    adminRole,
  }
}