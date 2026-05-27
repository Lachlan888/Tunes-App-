"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireModerator } from "@/lib/auth/roles"
import { normaliseKey } from "@/lib/music/keys"
import { notifyComposerAttributionAdded } from "@/lib/services/composer-notifications"

function appendQueryParam(url: string, key: string, value: string) {
  return url.includes("?")
    ? `${url}&${key}=${encodeURIComponent(value)}`
    : `${url}?${key}=${encodeURIComponent(value)}`
}

function getCleanString(formData: FormData, key: string) {
  return formData.get(key)?.toString().trim() ?? ""
}

function cleanObjectForLog(value: Record<string, unknown>) {
  return JSON.parse(JSON.stringify(value))
}

function getProposedString(
  proposedChanges: Record<string, unknown>,
  key: string
) {
  const value = proposedChanges[key]
  return typeof value === "string" ? value.trim() : ""
}

function buildModerationOutcomePreview({
  approved,
  moderatorComment,
}: {
  approved: boolean
  moderatorComment: string
}) {
  const outcome = approved ? "Approved." : "Rejected."
  const comment = moderatorComment.trim()

  if (!comment) {
    return outcome
  }

  return `${outcome} Moderator note: ${comment}`
}

async function notifyPieceEditRequester({
  supabase,
  requesterUserId,
  moderatorUserId,
  pieceId,
  approved,
  moderatorComment,
}: {
  supabase: Awaited<ReturnType<typeof requireModerator>>["supabase"]
  requesterUserId: string
  moderatorUserId: string
  pieceId: number
  approved: boolean
  moderatorComment: string
}) {
  if (requesterUserId === moderatorUserId) {
    return
  }

  const { error } = await supabase.from("user_notifications").insert({
    recipient_user_id: requesterUserId,
    actor_user_id: moderatorUserId,
    notification_type: approved
      ? "piece_edit_request_approved"
      : "piece_edit_request_rejected",
    piece_id: pieceId,
    body_preview: buildModerationOutcomePreview({
      approved,
      moderatorComment,
    }),
  })

  if (error) {
    console.error("Error creating moderation outcome notification:", error)
  }
}

export async function approvePieceEditRequest(formData: FormData) {
  const { supabase, user } = await requireModerator()

  const requestId = Number(formData.get("request_id"))
  const moderatorComment = getCleanString(formData, "moderator_comment")
  const redirectTo = getCleanString(formData, "redirect_to") || "/moderator"

  if (!requestId || Number.isNaN(requestId)) {
    redirect(appendQueryParam(redirectTo, "moderation", "missing_request"))
  }

  const { data: request, error: requestError } = await supabase
    .from("piece_edit_requests")
    .select("id, piece_id, requested_by, proposed_changes, status")
    .eq("id", requestId)
    .eq("status", "pending")
    .maybeSingle()

  if (requestError || !request) {
    redirect(appendQueryParam(redirectTo, "moderation", "request_not_found"))
  }

  const { data: piece, error: pieceError } = await supabase
    .from("pieces")
    .select("id, title, key, style, time_signature, composer, reference_url")
    .eq("id", request.piece_id)
    .maybeSingle()

  if (pieceError || !piece) {
    redirect(appendQueryParam(redirectTo, "moderation", "piece_not_found"))
  }

  const proposedChanges =
    (request.proposed_changes as Record<string, unknown>) ?? {}

  const updates: Record<string, string | null> = {}

  const title = getProposedString(proposedChanges, "title")
  const rawKey = getProposedString(proposedChanges, "key")
  const style = getProposedString(proposedChanges, "style")
  const timeSignature = getProposedString(proposedChanges, "time_signature")
  const composer = getProposedString(proposedChanges, "composer")
  const referenceUrl = getProposedString(proposedChanges, "reference_url")

  if (title) {
    updates.title = title
  }

  if (rawKey) {
    const normalisedKey = normaliseKey(rawKey)

    if (!normalisedKey) {
      redirect(appendQueryParam(redirectTo, "moderation", "invalid_key"))
    }

    updates.key = normalisedKey
  }

  if (style) {
    updates.style = style
  }

  if (timeSignature) {
    updates.time_signature = timeSignature
  }

  if (composer) {
    updates.composer = composer
  }

  if (referenceUrl) {
    try {
      new URL(referenceUrl)
      updates.reference_url = referenceUrl
    } catch {
      redirect(appendQueryParam(redirectTo, "moderation", "invalid_url"))
    }
  }

  if (Object.keys(updates).length > 0) {
    const { error: updateError } = await supabase
      .from("pieces")
      .update(updates)
      .eq("id", request.piece_id)

    if (updateError) {
      console.error("Error approving piece edit request:", updateError)
      redirect(appendQueryParam(redirectTo, "moderation", "error"))
    }

    const { error: logError } = await supabase.from("piece_change_log").insert({
      piece_id: request.piece_id,
      changed_by: user.id,
      source_request_id: request.id,
      before: cleanObjectForLog(piece),
      after: cleanObjectForLog({
        ...piece,
        ...updates,
      }),
      comment: moderatorComment || null,
    })

    if (logError) {
      console.error("Error writing piece change log:", logError)
    }
  }

  const { error: requestUpdateError } = await supabase
    .from("piece_edit_requests")
    .update({
      status: "approved",
      moderator_comment: moderatorComment || null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", request.id)

  if (requestUpdateError) {
    console.error("Error updating approved request:", requestUpdateError)
    redirect(appendQueryParam(redirectTo, "moderation", "error"))
  }

  await notifyPieceEditRequester({
    supabase,
    requesterUserId: request.requested_by,
    moderatorUserId: user.id,
    pieceId: request.piece_id,
    approved: true,
    moderatorComment,
  })

  revalidatePath("/moderator")
  revalidatePath(`/library/${request.piece_id}`)
  revalidatePath("/library")
  revalidatePath("/inbox")

  redirect(appendQueryParam(redirectTo, "moderation", "approved"))
}

export async function rejectPieceEditRequest(formData: FormData) {
  const { supabase, user } = await requireModerator()

  const requestId = Number(formData.get("request_id"))
  const moderatorComment = getCleanString(formData, "moderator_comment")
  const redirectTo = getCleanString(formData, "redirect_to") || "/moderator"

  if (!requestId || Number.isNaN(requestId)) {
    redirect(appendQueryParam(redirectTo, "moderation", "missing_request"))
  }

  const { data: request, error: requestLoadError } = await supabase
    .from("piece_edit_requests")
    .select("id, piece_id, requested_by")
    .eq("id", requestId)
    .eq("status", "pending")
    .maybeSingle()

  if (requestLoadError || !request) {
    redirect(appendQueryParam(redirectTo, "moderation", "request_not_found"))
  }

  const { error } = await supabase
    .from("piece_edit_requests")
    .update({
      status: "rejected",
      moderator_comment: moderatorComment || null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .eq("status", "pending")

  if (error) {
    console.error("Error rejecting edit request:", error)
    redirect(appendQueryParam(redirectTo, "moderation", "error"))
  }

  await notifyPieceEditRequester({
    supabase,
    requesterUserId: request.requested_by,
    moderatorUserId: user.id,
    pieceId: request.piece_id,
    approved: false,
    moderatorComment,
  })

  revalidatePath("/moderator")
  revalidatePath("/inbox")
  redirect(appendQueryParam(redirectTo, "moderation", "rejected"))
}

export async function hideReportedComment(formData: FormData) {
  const { supabase, user } = await requireModerator()

  const reportId = Number(formData.get("report_id"))
  const commentId = Number(formData.get("comment_id"))
  const moderatorNote = getCleanString(formData, "moderator_note")
  const redirectTo = getCleanString(formData, "redirect_to") || "/moderator"

  if (
    !reportId ||
    Number.isNaN(reportId) ||
    !commentId ||
    Number.isNaN(commentId)
  ) {
    redirect(appendQueryParam(redirectTo, "moderation", "missing_comment"))
  }

  const { data: comment, error: commentLoadError } = await supabase
    .from("piece_comments")
    .select("id, piece_id")
    .eq("id", commentId)
    .maybeSingle()

  if (commentLoadError || !comment) {
    redirect(appendQueryParam(redirectTo, "moderation", "comment_not_found"))
  }

  const { error: commentUpdateError } = await supabase
    .from("piece_comments")
    .update({
      moderation_status: "hidden",
      hidden_by: user.id,
      hidden_at: new Date().toISOString(),
    })
    .eq("id", commentId)

  if (commentUpdateError) {
    console.error("Error hiding reported comment:", commentUpdateError)
    redirect(appendQueryParam(redirectTo, "moderation", "error"))
  }

  const { error: reportUpdateError } = await supabase
    .from("comment_reports")
    .update({
      status: "actioned",
      reviewed_by: user.id,
      moderator_note: moderatorNote || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", reportId)

  if (reportUpdateError) {
    console.error("Error actioning comment report:", reportUpdateError)
    redirect(appendQueryParam(redirectTo, "moderation", "error"))
  }

  revalidatePath("/moderator")
  revalidatePath(`/library/${comment.piece_id}`)

  redirect(appendQueryParam(redirectTo, "moderation", "comment_hidden"))
}

export async function dismissCommentReport(formData: FormData) {
  const { supabase, user } = await requireModerator()

  const reportId = Number(formData.get("report_id"))
  const moderatorNote = getCleanString(formData, "moderator_note")
  const redirectTo = getCleanString(formData, "redirect_to") || "/moderator"

  if (!reportId || Number.isNaN(reportId)) {
    redirect(appendQueryParam(redirectTo, "moderation", "missing_report"))
  }

  const { error } = await supabase
    .from("comment_reports")
    .update({
      status: "dismissed",
      reviewed_by: user.id,
      moderator_note: moderatorNote || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", reportId)
    .eq("status", "pending")

  if (error) {
    console.error("Error dismissing comment report:", error)
    redirect(appendQueryParam(redirectTo, "moderation", "error"))
  }

  revalidatePath("/moderator")
  redirect(appendQueryParam(redirectTo, "moderation", "report_dismissed"))
}

export async function actionLoreReport(formData: FormData) {
  const { supabase, user } = await requireModerator()

  const reportId = Number(formData.get("report_id"))
  const pieceId = Number(formData.get("piece_id"))
  const moderatorNote = getCleanString(formData, "moderator_note")
  const redirectTo = getCleanString(formData, "redirect_to") || "/moderator"

  if (!reportId || Number.isNaN(reportId)) {
    redirect(appendQueryParam(redirectTo, "moderation", "missing_lore_report"))
  }

  const { error } = await supabase
    .from("piece_lore_reports")
    .update({
      status: "actioned",
      reviewed_by: user.id,
      moderator_note: moderatorNote || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", reportId)
    .eq("status", "pending")

  if (error) {
    console.error("Error actioning lore report:", error)
    redirect(appendQueryParam(redirectTo, "moderation", "error"))
  }

  revalidatePath("/moderator")

  if (pieceId && !Number.isNaN(pieceId)) {
    revalidatePath(`/library/${pieceId}`)
  }

  redirect(appendQueryParam(redirectTo, "moderation", "lore_actioned"))
}

export async function dismissLoreReport(formData: FormData) {
  const { supabase, user } = await requireModerator()

  const reportId = Number(formData.get("report_id"))
  const moderatorNote = getCleanString(formData, "moderator_note")
  const redirectTo = getCleanString(formData, "redirect_to") || "/moderator"

  if (!reportId || Number.isNaN(reportId)) {
    redirect(appendQueryParam(redirectTo, "moderation", "missing_lore_report"))
  }

  const { error } = await supabase
    .from("piece_lore_reports")
    .update({
      status: "dismissed",
      reviewed_by: user.id,
      moderator_note: moderatorNote || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", reportId)
    .eq("status", "pending")

  if (error) {
    console.error("Error dismissing lore report:", error)
    redirect(appendQueryParam(redirectTo, "moderation", "error"))
  }

  revalidatePath("/moderator")
  redirect(appendQueryParam(redirectTo, "moderation", "lore_dismissed"))
}

export async function directModeratorUpdatePiece(formData: FormData) {
  const { supabase, user } = await requireModerator()

  const pieceId = Number(formData.get("piece_id"))
  const redirectTo =
    getCleanString(formData, "redirect_to") || `/library/${pieceId}`

  if (!pieceId || Number.isNaN(pieceId)) {
    redirect(appendQueryParam(redirectTo, "moderator_edit", "missing_piece"))
  }

  const { data: existingPiece, error: existingPieceError } = await supabase
    .from("pieces")
    .select(
      "id, title, key, style, time_signature, composer, composer_user_id, reference_url"
    )
    .eq("id", pieceId)
    .maybeSingle()

  if (existingPieceError || !existingPiece) {
    redirect(appendQueryParam(redirectTo, "moderator_edit", "piece_not_found"))
  }

  const title = getCleanString(formData, "title")
  const rawKey = getCleanString(formData, "key")
  const rawStyle = getCleanString(formData, "style")
  const timeSignature = getCleanString(formData, "time_signature")
  const composer = getCleanString(formData, "composer")
  const composerUserId = getCleanString(formData, "composer_user_id")
  const referenceUrl = getCleanString(formData, "reference_url")
  const moderatorComment = getCleanString(formData, "moderator_comment")

  if (!title) {
    redirect(appendQueryParam(redirectTo, "moderator_edit", "missing_title"))
  }

  const updates: Record<string, string | null> = {
    title,
    key: null,
    style: rawStyle || null,
    time_signature: timeSignature || null,
    composer: composer || null,
    composer_user_id: composerUserId || null,
    reference_url: referenceUrl || null,
  }

  if (rawKey) {
    const normalisedKey = normaliseKey(rawKey)

    if (!normalisedKey) {
      redirect(appendQueryParam(redirectTo, "moderator_edit", "invalid_key"))
    }

    updates.key = normalisedKey
  }

  if (referenceUrl) {
    try {
      new URL(referenceUrl)
    } catch {
      redirect(appendQueryParam(redirectTo, "moderator_edit", "invalid_url"))
    }
  }

  if (composerUserId) {
    const { data: composerProfile, error: composerProfileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", composerUserId)
      .maybeSingle()

    if (composerProfileError || !composerProfile) {
      redirect(
        appendQueryParam(redirectTo, "moderator_edit", "invalid_composer")
      )
    }
  }

  const { error: updateError } = await supabase
    .from("pieces")
    .update(updates)
    .eq("id", pieceId)

  if (updateError) {
    console.error("Error directly updating piece:", updateError)
    redirect(appendQueryParam(redirectTo, "moderator_edit", "error"))
  }

  if (
    updates.composer_user_id &&
    updates.composer_user_id !== existingPiece.composer_user_id
  ) {
    await notifyComposerAttributionAdded({
      supabase,
      recipientUserId: updates.composer_user_id,
      actorUserId: user.id,
      piece: {
        id: existingPiece.id,
        title,
      },
    })
  }

  const { error: logError } = await supabase.from("piece_change_log").insert({
    piece_id: pieceId,
    changed_by: user.id,
    source_request_id: null,
    before: cleanObjectForLog(existingPiece),
    after: cleanObjectForLog({
      ...existingPiece,
      ...updates,
    }),
    comment: moderatorComment || null,
  })

  if (logError) {
    console.error("Error writing direct piece change log:", logError)
  }

  revalidatePath(`/library/${pieceId}`)
  revalidatePath("/library")
  redirect(appendQueryParam(redirectTo, "moderator_edit", "success"))
}
