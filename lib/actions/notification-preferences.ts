"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { NotificationDigestFrequency } from "@/lib/types"

const VALID_DIGEST_FREQUENCIES = new Set<NotificationDigestFrequency>([
  "daily",
  "weekly",
  "never",
])

function asBoolean(value: FormDataEntryValue | null) {
  return value === "on"
}

function redirectWithStatus(status: string): never {
  redirect(`/dashboard?communication_settings=${encodeURIComponent(status)}`)
}

export async function updateNotificationPreferences(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const digestFrequency = String(
    formData.get("digest_frequency") ?? ""
  ) as NotificationDigestFrequency

  if (!VALID_DIGEST_FREQUENCIES.has(digestFrequency)) {
    redirectWithStatus("invalid_digest")
  }

  const { error } = await supabase.from("notification_preferences").upsert(
    {
      user_id: user.id,
      email_enabled: asBoolean(formData.get("email_enabled")),
      email_friend_requests: asBoolean(formData.get("email_friend_requests")),
      email_direct_messages: asBoolean(formData.get("email_direct_messages")),
      email_comment_replies: asBoolean(formData.get("email_comment_replies")),
      email_activity_replies: asBoolean(formData.get("email_activity_replies")),
      email_setlist_invites: asBoolean(formData.get("email_setlist_invites")),
      email_badges: asBoolean(formData.get("email_badges")),
      email_practice_reminders: asBoolean(
        formData.get("email_practice_reminders")
      ),
      email_weekly_summary: asBoolean(formData.get("email_weekly_summary")),
      email_public_list_activity: asBoolean(
        formData.get("email_public_list_activity")
      ),
      email_product_updates: asBoolean(formData.get("email_product_updates")),
      digest_frequency: digestFrequency,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  )

  if (error) {
    console.error("Error saving notification preferences:", error)
    redirectWithStatus("error")
  }

  revalidatePath("/dashboard")
  redirectWithStatus("saved")
}
