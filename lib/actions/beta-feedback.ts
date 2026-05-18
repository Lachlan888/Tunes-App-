"use server"

import { createClient } from "@/lib/supabase/server"
import { recordAppEvent } from "@/lib/services/app-events"
import type {
  BetaFeedbackCategory,
  BetaFeedbackSeverity,
} from "@/lib/types"

export type BetaFeedbackFormState = {
  status: "idle" | "success" | "error"
  message: string | null
}

const VALID_CATEGORIES: BetaFeedbackCategory[] = [
  "broken",
  "confusing",
  "design",
  "feature_request",
  "other",
]

const VALID_SEVERITIES: BetaFeedbackSeverity[] = ["low", "medium", "high"]

function normaliseCategory(value: FormDataEntryValue | null) {
  const category = String(value ?? "").trim()

  if (VALID_CATEGORIES.includes(category as BetaFeedbackCategory)) {
    return category as BetaFeedbackCategory
  }

  return "other"
}

function normaliseSeverity(value: FormDataEntryValue | null) {
  const severity = String(value ?? "").trim()

  if (VALID_SEVERITIES.includes(severity as BetaFeedbackSeverity)) {
    return severity as BetaFeedbackSeverity
  }

  return "medium"
}

function normaliseOptionalNumber(value: FormDataEntryValue | null) {
  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null
  }

  return parsed
}

export async function submitBetaFeedback(
  _prevState: BetaFeedbackFormState,
  formData: FormData
): Promise<BetaFeedbackFormState> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      status: "error",
      message: "Please log in again before sending feedback.",
    }
  }

  const category = normaliseCategory(formData.get("category"))
  const severity = normaliseSeverity(formData.get("severity"))
  const message = String(formData.get("message") ?? "").trim()
  const pagePath = String(formData.get("page_path") ?? "").trim() || "/"
  const pageUrl = String(formData.get("page_url") ?? "").trim() || null
  const browser = String(formData.get("browser") ?? "").trim() || null
  const viewportWidth = normaliseOptionalNumber(formData.get("viewport_width"))
  const viewportHeight = normaliseOptionalNumber(formData.get("viewport_height"))

  if (!message) {
    return {
      status: "error",
      message: "Write a short note before sending feedback.",
    }
  }

  const { error } = await supabase.from("beta_feedback").insert({
    user_id: user.id,
    category,
    severity,
    page_path: pagePath,
    page_url: pageUrl,
    message,
    browser,
    viewport_width: viewportWidth,
    viewport_height: viewportHeight,
  })

  if (error) {
    console.error("Error submitting beta feedback:", error)

    return {
      status: "error",
      message: "Could not send feedback. Please try again.",
    }
  }

  await recordAppEvent({
    supabase,
    userId: user.id,
    eventType: "submitted_feedback",
    pagePath,
    entityType: "beta_feedback",
    metadata: {
      category,
      severity,
    },
  })

  return {
    status: "success",
    message: "Feedback sent. Thanks.",
  }
}