"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireAppAdmin } from "@/lib/auth/roles"
import type {
  BetaFeedbackOwnerPriority,
  BetaFeedbackStatus,
} from "@/lib/types"

const VALID_STATUSES: BetaFeedbackStatus[] = [
  "new",
  "triaged",
  "planned",
  "fixed",
  "wont_fix",
  "needs_more_info",
]

const VALID_PRIORITIES: BetaFeedbackOwnerPriority[] = [
  "low",
  "medium",
  "high",
  "launch_blocker",
]

function appendQueryParam(url: string, key: string, value: string) {
  return url.includes("?")
    ? `${url}&${key}=${encodeURIComponent(value)}`
    : `${url}?${key}=${encodeURIComponent(value)}`
}

export async function updateBetaFeedbackAdminFields(formData: FormData) {
  const { supabase } = await requireAppAdmin()

  const feedbackId = Number(formData.get("feedback_id"))
  const status = String(formData.get("status") ?? "").trim()
  const ownerPriority = String(formData.get("owner_priority") ?? "").trim()
  const ownerNotes = String(formData.get("owner_notes") ?? "").trim()
  const redirectTo = String(formData.get("redirect_to") ?? "/dev")

  if (!Number.isInteger(feedbackId) || feedbackId <= 0) {
    redirect(appendQueryParam(redirectTo, "dev_feedback", "missing_feedback"))
  }

  if (!VALID_STATUSES.includes(status as BetaFeedbackStatus)) {
    redirect(appendQueryParam(redirectTo, "dev_feedback", "invalid_status"))
  }

  if (!VALID_PRIORITIES.includes(ownerPriority as BetaFeedbackOwnerPriority)) {
    redirect(appendQueryParam(redirectTo, "dev_feedback", "invalid_priority"))
  }

  const resolvedAt =
    status === "fixed" || status === "wont_fix" ? new Date().toISOString() : null

  const { error } = await supabase
    .from("beta_feedback")
    .update({
      status,
      owner_priority: ownerPriority,
      owner_notes: ownerNotes || null,
      resolved_at: resolvedAt,
    })
    .eq("id", feedbackId)

  if (error) {
    console.error("Error updating beta feedback:", error)
    redirect(appendQueryParam(redirectTo, "dev_feedback", "error"))
  }

  revalidatePath("/dev")
  redirect(appendQueryParam(redirectTo, "dev_feedback", "updated"))
}