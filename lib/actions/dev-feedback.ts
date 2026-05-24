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

type FeedbackMessageContext = {
  pagePath: string | null
  originalMessage: string | null
  ownerNotes: string | null
  status: BetaFeedbackStatus
}

function appendQueryParam(url: string, key: string, value: string) {
  return url.includes("?")
    ? `${url}&${key}=${encodeURIComponent(value)}`
    : `${url}?${key}=${encodeURIComponent(value)}`
}

function cleanRedirectTo(value: FormDataEntryValue | null, fallback: string) {
  const raw = value?.toString() || fallback

  if (!raw.startsWith("/")) {
    return fallback
  }

  return raw
}

function previewBody(body: string) {
  const cleaned = body.replace(/\s+/g, " ").trim()
  return cleaned.length > 180 ? `${cleaned.slice(0, 180).trim()}…` : cleaned
}

function formatStatusForMessage(status: BetaFeedbackStatus) {
  if (status === "new") return "New"
  if (status === "triaged") return "Triaged"
  if (status === "planned") return "Planned"
  if (status === "fixed") return "Fixed"
  if (status === "wont_fix") return "Won't fix"
  if (status === "needs_more_info") return "Needs more info"

  return status
}

function buildFeedbackUpdateMessage({
  pagePath,
  originalMessage,
  ownerNotes,
  status,
}: FeedbackMessageContext) {
  const lines = [
    "Thanks for sending feedback on Tunes App.",
    "",
    pagePath && pagePath !== "unknown" ? `Page: ${pagePath}` : null,
    `Status: ${formatStatusForMessage(status)}`,
    "",
    "Update:",
    ownerNotes?.trim() ||
      "I’ve reviewed this feedback and updated its status in the beta cockpit.",
  ].filter((line): line is string => line !== null)

  if (originalMessage?.trim()) {
    lines.push("", "Your feedback:", originalMessage.trim())
  }

  return lines.join("\n")
}

async function sendFeedbackDirectMessage({
  supabase,
  senderUserId,
  recipientUserId,
  body,
}: {
  supabase: Awaited<ReturnType<typeof requireAppAdmin>>["supabase"]
  senderUserId: string
  recipientUserId: string
  body: string
}) {
  if (senderUserId === recipientUserId) {
    return
  }

  const { data: recipientProfile, error: recipientProfileError } =
    await supabase
      .from("profiles")
      .select("id")
      .eq("id", recipientUserId)
      .maybeSingle()

  if (recipientProfileError) {
    throw new Error(recipientProfileError.message)
  }

  if (!recipientProfile) {
    return
  }

  const { data: insertedMessage, error: messageError } = await supabase
    .from("direct_messages")
    .insert({
      sender_user_id: senderUserId,
      recipient_user_id: recipientUserId,
      body,
    })
    .select("id")
    .single()

  if (messageError) {
    throw new Error(messageError.message)
  }

  const { error: notificationError } = await supabase
    .from("user_notifications")
    .insert({
      recipient_user_id: recipientUserId,
      actor_user_id: senderUserId,
      notification_type: "direct_message",
      direct_message_id: insertedMessage.id,
      body_preview: previewBody(body),
    })

  if (notificationError) {
    throw new Error(notificationError.message)
  }
}

export async function updateBetaFeedbackAdminFields(formData: FormData) {
  const { supabase, user } = await requireAppAdmin()

  const feedbackId = Number(formData.get("feedback_id"))
  const submittedStatus = String(formData.get("status") ?? "").trim()
  const ownerPriority = String(formData.get("owner_priority") ?? "").trim()
  const ownerNotes = String(formData.get("owner_notes") ?? "").trim()
  const redirectTo = cleanRedirectTo(formData.get("redirect_to"), "/dev")
  const intent = String(formData.get("intent") ?? "update").trim()
  const notifyReporter =
    String(formData.get("notify_reporter") ?? "") === "true"

  if (!Number.isInteger(feedbackId) || feedbackId <= 0) {
    redirect(appendQueryParam(redirectTo, "dev_feedback", "missing_feedback"))
  }

  if (!VALID_PRIORITIES.includes(ownerPriority as BetaFeedbackOwnerPriority)) {
    redirect(appendQueryParam(redirectTo, "dev_feedback", "invalid_priority"))
  }

  const isResolveIntent = intent === "resolve"
  const status = isResolveIntent ? "fixed" : submittedStatus

  if (!VALID_STATUSES.includes(status as BetaFeedbackStatus)) {
    redirect(appendQueryParam(redirectTo, "dev_feedback", "invalid_status"))
  }

  const { data: existingFeedback, error: existingFeedbackError } =
    await supabase
      .from("beta_feedback")
      .select("id, user_id, page_path, message")
      .eq("id", feedbackId)
      .maybeSingle()

  if (existingFeedbackError) {
    console.error("Error loading beta feedback:", existingFeedbackError)
    redirect(appendQueryParam(redirectTo, "dev_feedback", "error"))
  }

  if (!existingFeedback) {
    redirect(appendQueryParam(redirectTo, "dev_feedback", "missing_feedback"))
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

  const shouldSendMessage = isResolveIntent || notifyReporter

  if (shouldSendMessage) {
    const messageBody = buildFeedbackUpdateMessage({
      pagePath: existingFeedback.page_path,
      originalMessage: existingFeedback.message,
      ownerNotes,
      status: status as BetaFeedbackStatus,
    })

    try {
      await sendFeedbackDirectMessage({
        supabase,
        senderUserId: user.id,
        recipientUserId: existingFeedback.user_id,
        body: messageBody,
      })
    } catch (messageError) {
      console.error("Error sending feedback message:", messageError)
      redirect(appendQueryParam(redirectTo, "dev_feedback", "message_error"))
    }
  }

  revalidatePath("/dev")
  revalidatePath("/inbox")

  if (isResolveIntent && shouldSendMessage) {
    redirect(appendQueryParam(redirectTo, "dev_feedback", "resolved_notified"))
  }

  if (notifyReporter) {
    redirect(appendQueryParam(redirectTo, "dev_feedback", "updated_notified"))
  }

  redirect(appendQueryParam(redirectTo, "dev_feedback", "updated"))
}

export async function resolveBetaFeedback(formData: FormData) {
  const { supabase, user } = await requireAppAdmin()

  const feedbackId = Number(formData.get("feedback_id"))
  const redirectTo = cleanRedirectTo(formData.get("redirect_to"), "/dev")

  if (!Number.isInteger(feedbackId) || feedbackId <= 0) {
    redirect(appendQueryParam(redirectTo, "dev_feedback", "missing_feedback"))
  }

  const { data: existingFeedback, error: existingFeedbackError } =
    await supabase
      .from("beta_feedback")
      .select("id, user_id, page_path, message, owner_notes")
      .eq("id", feedbackId)
      .maybeSingle()

  if (existingFeedbackError) {
    console.error("Error loading beta feedback:", existingFeedbackError)
    redirect(appendQueryParam(redirectTo, "dev_feedback", "error"))
  }

  if (!existingFeedback) {
    redirect(appendQueryParam(redirectTo, "dev_feedback", "missing_feedback"))
  }

  const { error } = await supabase
    .from("beta_feedback")
    .update({
      status: "fixed",
      resolved_at: new Date().toISOString(),
    })
    .eq("id", feedbackId)

  if (error) {
    console.error("Error resolving beta feedback:", error)
    redirect(appendQueryParam(redirectTo, "dev_feedback", "error"))
  }

  const messageBody = buildFeedbackUpdateMessage({
    pagePath: existingFeedback.page_path,
    originalMessage: existingFeedback.message,
    ownerNotes: existingFeedback.owner_notes,
    status: "fixed",
  })

  try {
    await sendFeedbackDirectMessage({
      supabase,
      senderUserId: user.id,
      recipientUserId: existingFeedback.user_id,
      body: messageBody,
    })
  } catch (messageError) {
    console.error("Error sending feedback message:", messageError)
    redirect(appendQueryParam(redirectTo, "dev_feedback", "message_error"))
  }

  revalidatePath("/dev")
  revalidatePath("/inbox")

  redirect(appendQueryParam(redirectTo, "dev_feedback", "resolved_notified"))
}