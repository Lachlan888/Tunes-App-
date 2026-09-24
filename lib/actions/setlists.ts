"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import {
  notifySetlistMembers,
  notifySingleUser,
} from "@/lib/services/setlist-notifications"
import { normaliseKey } from "@/lib/music/keys"
import { createClient } from "@/lib/supabase/server"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

function appendQueryParam(url: string, key: string, value: string) {
  return url.includes("?")
    ? `${url}&${key}=${encodeURIComponent(value)}`
    : `${url}?${key}=${encodeURIComponent(value)}`
}

function setlistHref(setlistId: number) {
  return `/setlists/${setlistId}`
}

async function requireAcceptedSetlistMember(
  supabase: SupabaseServerClient,
  setlistId: number,
  userId: string
) {
  const { data, error } = await supabase
    .from("setlist_members")
    .select("id")
    .eq("setlist_id", setlistId)
    .eq("user_id", userId)
    .eq("status", "accepted")
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return Boolean(data)
}

async function loadSetlistName(
  supabase: SupabaseServerClient,
  setlistId: number
) {
  const { data, error } = await supabase
    .from("setlists")
    .select("name")
    .eq("id", setlistId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data?.name ?? "this setlist"
}

async function loadPieceTitle(supabase: SupabaseServerClient, pieceId: number) {
  const { data, error } = await supabase
    .from("pieces")
    .select("title")
    .eq("id", pieceId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data?.title ?? "a tune"
}

export async function createSetlist(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const name = String(formData.get("name") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const eventDate = String(formData.get("event_date") ?? "").trim()
  const location = String(formData.get("location") ?? "").trim()

  if (!name) {
    redirect("/setlists?setlist=missing_name")
  }

  const { data: setlist, error: setlistError } = await supabase
    .from("setlists")
    .insert({
      name,
      description: description || null,
      event_date: eventDate || null,
      location: location || null,
      created_by: user.id,
    })
    .select("id")
    .single()

  if (setlistError || !setlist) {
    redirect("/setlists?setlist=error")
  }

  const { error: memberError } = await supabase.from("setlist_members").insert({
    setlist_id: setlist.id,
    user_id: user.id,
    status: "accepted",
    invited_by: user.id,
    responded_at: new Date().toISOString(),
  })

  if (memberError) {
    redirect("/setlists?setlist=error")
  }

  revalidatePath("/setlists")
  redirect(`/setlists/${setlist.id}?mode=manage&setlist=created`)
}

export async function updateSetlist(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const setlistId = Number(formData.get("setlist_id"))
  const name = String(formData.get("name") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const eventDate = String(formData.get("event_date") ?? "").trim()
  const location = String(formData.get("location") ?? "").trim()
  const redirectTo = String(formData.get("redirect_to") ?? setlistHref(setlistId))

  if (!setlistId || Number.isNaN(setlistId)) {
    redirect(appendQueryParam(redirectTo, "setlist", "missing_setlist"))
  }

  if (!name) {
    redirect(appendQueryParam(redirectTo, "setlist", "missing_name"))
  }

  const canEdit = await requireAcceptedSetlistMember(
    supabase,
    setlistId,
    user.id
  )

  if (!canEdit) {
    redirect(appendQueryParam(redirectTo, "setlist", "forbidden"))
  }

  const { data: updated, error } = await supabase
    .from("setlists")
    .update({
      name,
      description: description || null,
      event_date: eventDate || null,
      location: location || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", setlistId)
    .eq("updated_at", String(formData.get("expected_version") ?? ""))
    .select("id")
    .maybeSingle()

  if (error) {
    redirect(appendQueryParam(redirectTo, "setlist", "error"))
  }
  if (!updated) redirect(appendQueryParam(redirectTo, "setlist", "conflict"))

  await notifySetlistMembers({
    supabase,
    setlistId,
    actorUserId: user.id,
    notificationType: "setlist_details_updated",
    bodyPreview: `${name} was updated.`,
  })

  revalidatePath("/setlists")
  revalidatePath(`/setlists/${setlistId}`)
  redirect(appendQueryParam(redirectTo, "setlist", "updated"))
}

export async function inviteSetlistCollaborator(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const setlistId = Number(formData.get("setlist_id"))
  const collaboratorUserId = String(
    formData.get("collaborator_user_id") ?? ""
  ).trim()
  const redirectTo = String(formData.get("redirect_to") ?? setlistHref(setlistId))

  if (!setlistId || Number.isNaN(setlistId)) {
    redirect(appendQueryParam(redirectTo, "setlist_invite", "missing_setlist"))
  }

  if (!collaboratorUserId) {
    redirect(appendQueryParam(redirectTo, "setlist_invite", "missing_user"))
  }

  if (collaboratorUserId === user.id) {
    redirect(appendQueryParam(redirectTo, "setlist_invite", "self"))
  }

  const canInvite = await requireAcceptedSetlistMember(
    supabase,
    setlistId,
    user.id
  )

  if (!canInvite) {
    redirect(appendQueryParam(redirectTo, "setlist_invite", "forbidden"))
  }

  const { data: connection, error: connectionError } = await supabase
    .from("connections")
    .select("id, status, requester_id, addressee_id")
    .or(
      `and(requester_id.eq.${user.id},addressee_id.eq.${collaboratorUserId}),and(requester_id.eq.${collaboratorUserId},addressee_id.eq.${user.id})`
    )
    .eq("status", "accepted")
    .maybeSingle()

  if (connectionError) {
    throw new Error(connectionError.message)
  }

  if (!connection) {
    redirect(appendQueryParam(redirectTo, "setlist_invite", "not_friend"))
  }

  const { data: existingMember, error: existingError } = await supabase
    .from("setlist_members")
    .select("id, status")
    .eq("setlist_id", setlistId)
    .eq("user_id", collaboratorUserId)
    .maybeSingle()

  if (existingError) {
    throw new Error(existingError.message)
  }

  if (existingMember) {
    redirect(appendQueryParam(redirectTo, "setlist_invite", "duplicate"))
  }

  const { error: insertError } = await supabase.from("setlist_members").insert({
    setlist_id: setlistId,
    user_id: collaboratorUserId,
    status: "pending",
    invited_by: user.id,
  })

  if (insertError) {
    redirect(appendQueryParam(redirectTo, "setlist_invite", "error"))
  }

  const setlistName = await loadSetlistName(supabase, setlistId)

  await notifySingleUser({
    supabase,
    recipientUserId: collaboratorUserId,
    actorUserId: user.id,
    notificationType: "setlist_invite",
    setlistId,
    bodyPreview: `You were invited to ${setlistName}.`,
  })

  revalidatePath("/setlists")
  revalidatePath(`/setlists/${setlistId}`)
  redirect(appendQueryParam(redirectTo, "setlist_invite", "sent"))
}

export async function acceptSetlistInvite(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const membershipId = Number(formData.get("membership_id"))
  const redirectTo = String(formData.get("redirect_to") ?? "/setlists")

  if (!membershipId || Number.isNaN(membershipId)) {
    redirect(appendQueryParam(redirectTo, "setlist_invite", "missing_invite"))
  }

  const { data: membership, error: membershipError } = await supabase
    .from("setlist_members")
    .select("id, setlist_id, user_id, status")
    .eq("id", membershipId)
    .maybeSingle()

  if (membershipError) {
    throw new Error(membershipError.message)
  }

  if (!membership) {
    redirect(appendQueryParam(redirectTo, "setlist_invite", "not_found"))
  }

  if (membership.user_id !== user.id) {
    redirect(appendQueryParam(redirectTo, "setlist_invite", "forbidden"))
  }

  if (membership.status !== "pending") {
    redirect(appendQueryParam(redirectTo, "setlist_invite", "invalid_status"))
  }

  const { error } = await supabase
    .from("setlist_members")
    .update({
      status: "accepted",
      responded_at: new Date().toISOString(),
    })
    .eq("id", membershipId)

  if (error) {
    redirect(appendQueryParam(redirectTo, "setlist_invite", "error"))
  }

  const setlistName = await loadSetlistName(supabase, membership.setlist_id)

  await notifySetlistMembers({
    supabase,
    setlistId: membership.setlist_id,
    actorUserId: user.id,
    notificationType: "setlist_invite_accepted",
    bodyPreview: `A collaborator joined ${setlistName}.`,
  })

  revalidatePath("/setlists")
  revalidatePath(`/setlists/${membership.setlist_id}`)
  redirect(`/setlists/${membership.setlist_id}?setlist_invite=accepted`)
}

export async function declineSetlistInvite(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const membershipId = Number(formData.get("membership_id"))
  const redirectTo = String(formData.get("redirect_to") ?? "/setlists")

  if (!membershipId || Number.isNaN(membershipId)) {
    redirect(appendQueryParam(redirectTo, "setlist_invite", "missing_invite"))
  }

  const { data: membership, error: membershipError } = await supabase
    .from("setlist_members")
    .select("id, user_id, status")
    .eq("id", membershipId)
    .maybeSingle()

  if (membershipError) {
    throw new Error(membershipError.message)
  }

  if (!membership) {
    redirect(appendQueryParam(redirectTo, "setlist_invite", "not_found"))
  }

  if (membership.user_id !== user.id) {
    redirect(appendQueryParam(redirectTo, "setlist_invite", "forbidden"))
  }

  if (membership.status !== "pending") {
    redirect(appendQueryParam(redirectTo, "setlist_invite", "invalid_status"))
  }

  const { error } = await supabase
    .from("setlist_members")
    .update({
      status: "declined",
      responded_at: new Date().toISOString(),
    })
    .eq("id", membershipId)

  if (error) {
    redirect(appendQueryParam(redirectTo, "setlist_invite", "error"))
  }

  revalidatePath("/setlists")
  redirect(appendQueryParam(redirectTo, "setlist_invite", "declined"))
}

export async function addTuneToSetlist(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const setlistId = Number(formData.get("setlist_id"))
  const pieceId = Number(formData.get("piece_id"))
  const redirectTo = String(formData.get("redirect_to") ?? setlistHref(setlistId))

  if (
    !setlistId ||
    Number.isNaN(setlistId) ||
    !pieceId ||
    Number.isNaN(pieceId)
  ) {
    redirect(appendQueryParam(redirectTo, "setlist_item", "missing_item"))
  }

  const canEdit = await requireAcceptedSetlistMember(
    supabase,
    setlistId,
    user.id
  )

  if (!canEdit) {
    redirect(appendQueryParam(redirectTo, "setlist_item", "forbidden"))
  }

  const { data, error: insertError } = await supabase.rpc("mutate_setlist_item", {
    p_setlist_id: setlistId, p_operation: "add", p_piece_id: pieceId,
  })
  const insertedItem = Array.isArray(data) ? data[0] : data
  if (insertError || insertedItem?.status !== "success") {
    const status = ["duplicate", "limit", "forbidden"].includes(insertedItem?.status) ? insertedItem.status : "error"
    redirect(appendQueryParam(redirectTo, "setlist_item", status))
  }

  const [setlistName, pieceTitle] = await Promise.all([
    loadSetlistName(supabase, setlistId),
    loadPieceTitle(supabase, pieceId),
  ])

  await notifySetlistMembers({
    supabase,
    setlistId,
    actorUserId: user.id,
    notificationType: "setlist_tune_added",
    pieceId,
    setlistItemId: insertedItem.item_id,
    bodyPreview: `${pieceTitle} was added to ${setlistName}.`,
  })

  revalidatePath("/setlists")
  revalidatePath(`/setlists/${setlistId}`)
  redirect(appendQueryParam(redirectTo, "setlist_item", "added"))
}

export async function updateSetlistItem(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const setlistId = Number(formData.get("setlist_id"))
  const itemId = Number(formData.get("setlist_item_id"))
  const rawPerformanceKey = String(formData.get("performance_key") ?? "").trim()
  const performanceKey = rawPerformanceKey
    ? normaliseKey(rawPerformanceKey)
    : null
  const notes = String(formData.get("notes") ?? "").trim()
  const chartUrl = String(formData.get("chart_url") ?? "").trim()
  const chartLabel = String(formData.get("chart_label") ?? "").trim()
  const chartType = String(formData.get("chart_type") ?? "").trim()
  const redirectTo = String(formData.get("redirect_to") ?? setlistHref(setlistId))

  if (
    !setlistId ||
    Number.isNaN(setlistId) ||
    !itemId ||
    Number.isNaN(itemId)
  ) {
    redirect(appendQueryParam(redirectTo, "setlist_item", "missing_item"))
  }

  const canEdit = await requireAcceptedSetlistMember(
    supabase,
    setlistId,
    user.id
  )

  if (!canEdit) {
    redirect(appendQueryParam(redirectTo, "setlist_item", "forbidden"))
  }

  if (rawPerformanceKey && !performanceKey) {
    redirect(appendQueryParam(redirectTo, "setlist_item", "invalid_key"))
  }

  const { data: existingItem, error: existingError } = await supabase
    .from("setlist_items")
    .select("id, piece_id")
    .eq("id", itemId)
    .eq("setlist_id", setlistId)
    .maybeSingle()

  if (existingError) {
    throw new Error(existingError.message)
  }

  if (!existingItem) {
    redirect(appendQueryParam(redirectTo, "setlist_item", "not_found"))
  }

  const { data, error } = await supabase.rpc("mutate_setlist_item", {
    p_setlist_id: setlistId, p_operation: "edit", p_item_id: itemId,
    p_expected_updated_at: String(formData.get("expected_version") ?? "") || null,
    p_details: {
      performance_key: performanceKey, notes: notes || null,
      chart_url: chartUrl || null, chart_label: chartLabel || null, chart_type: chartType || null,
    },
  })
  const result = Array.isArray(data) ? data[0] : data
  if (error || result?.status !== "success") {
    redirect(appendQueryParam(redirectTo, "setlist_item", result?.status === "conflict" ? "conflict" : "error"))
  }

  const pieceTitle = await loadPieceTitle(supabase, existingItem.piece_id)

  await notifySetlistMembers({
    supabase,
    setlistId,
    actorUserId: user.id,
    notificationType: "setlist_item_updated",
    pieceId: existingItem.piece_id,
    setlistItemId: itemId,
    bodyPreview: `${pieceTitle} was updated in the setlist.`,
  })

  revalidatePath(`/setlists/${setlistId}`)
  redirect(appendQueryParam(redirectTo, "setlist_item", "updated"))
}

export async function removeTuneFromSetlist(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const setlistId = Number(formData.get("setlist_id"))
  const itemId = Number(formData.get("setlist_item_id"))
  const redirectTo = String(formData.get("redirect_to") ?? setlistHref(setlistId))

  if (
    !setlistId ||
    Number.isNaN(setlistId) ||
    !itemId ||
    Number.isNaN(itemId)
  ) {
    redirect(appendQueryParam(redirectTo, "setlist_item", "missing_item"))
  }

  const canEdit = await requireAcceptedSetlistMember(
    supabase,
    setlistId,
    user.id
  )

  if (!canEdit) {
    redirect(appendQueryParam(redirectTo, "setlist_item", "forbidden"))
  }

  const { data: existingItem, error: existingError } = await supabase
    .from("setlist_items")
    .select("id, piece_id")
    .eq("id", itemId)
    .eq("setlist_id", setlistId)
    .maybeSingle()

  if (existingError) {
    throw new Error(existingError.message)
  }

  if (!existingItem) {
    redirect(appendQueryParam(redirectTo, "setlist_item", "not_found"))
  }

  const pieceTitle = await loadPieceTitle(supabase, existingItem.piece_id)

  const { data, error } = await supabase.rpc("mutate_setlist_item", {
    p_setlist_id: setlistId, p_operation: "remove", p_item_id: itemId,
  })
  const result = Array.isArray(data) ? data[0] : data
  if (error || result?.status !== "success") {
    redirect(appendQueryParam(redirectTo, "setlist_item", result?.status === "not_found" ? "not_found" : "error"))
  }

  await notifySetlistMembers({
    supabase,
    setlistId,
    actorUserId: user.id,
    notificationType: "setlist_tune_removed",
    pieceId: existingItem.piece_id,
    bodyPreview: `${pieceTitle} was removed from the setlist.`,
  })

  revalidatePath(`/setlists/${setlistId}`)
  redirect(appendQueryParam(redirectTo, "setlist_item", "removed"))
}

export async function moveSetlistItem(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const setlistId = Number(formData.get("setlist_id"))
  const itemId = Number(formData.get("setlist_item_id"))
  const direction = String(formData.get("direction") ?? "")
  const redirectTo = String(formData.get("redirect_to") ?? setlistHref(setlistId))

  if (
    !setlistId ||
    Number.isNaN(setlistId) ||
    !itemId ||
    Number.isNaN(itemId)
  ) {
    redirect(appendQueryParam(redirectTo, "setlist_item", "missing_item"))
  }

  if (direction !== "up" && direction !== "down") {
    redirect(appendQueryParam(redirectTo, "setlist_item", "invalid_move"))
  }

  const canEdit = await requireAcceptedSetlistMember(
    supabase,
    setlistId,
    user.id
  )

  if (!canEdit) {
    redirect(appendQueryParam(redirectTo, "setlist_item", "forbidden"))
  }

  const { data: setlist } = await supabase.from("setlists").select("updated_at").eq("id", setlistId).single()
  const { data: items, error: itemsError } = await supabase
    .from("setlist_items")
    .select("id, position")
    .eq("setlist_id", setlistId)
    .order("position", { ascending: true })

  if (itemsError) {
    throw new Error(itemsError.message)
  }

  const typedItems = items ?? []
  const currentIndex = typedItems.findIndex((item) => item.id === itemId)

  if (currentIndex === -1) {
    redirect(appendQueryParam(redirectTo, "setlist_item", "not_found"))
  }

  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

  if (targetIndex < 0 || targetIndex >= typedItems.length) {
    redirect(appendQueryParam(redirectTo, "setlist_item", "moved"))
  }

  const orderedIds = typedItems.map(item => item.id)
  ;[orderedIds[currentIndex], orderedIds[targetIndex]] = [orderedIds[targetIndex], orderedIds[currentIndex]]
  const result = await reorderSetlistItems({ setlistId, orderedItemIds: orderedIds, expectedVersion: setlist?.updated_at ?? "" })
  redirect(appendQueryParam(redirectTo, "setlist_item", result.status === "success" ? "moved" : result.status))
}

export async function reorderSetlistItems(input: {
  setlistId: number
  orderedItemIds: number[]
  expectedVersion: string
}): Promise<{
  status: "success" | "conflict" | "error"
  message: string
  version?: string
}> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { status: "error", message: "Sign in again before changing the order." }
  }

  const setlistId = Number(input.setlistId)
  const orderedItemIds = Array.isArray(input.orderedItemIds) ? input.orderedItemIds.map(Number) : []
  const expectedVersion = String(input.expectedVersion ?? "")
  const validVersion = Number.isFinite(Date.parse(expectedVersion))

  if (
    !Number.isInteger(setlistId) ||
    setlistId < 1 ||
    orderedItemIds.length > 200 ||
    orderedItemIds.some((id) => !Number.isInteger(id) || id < 1) ||
    new Set(orderedItemIds).size !== orderedItemIds.length ||
    !validVersion
  ) {
    return { status: "error", message: "That order could not be validated." }
  }

  const canEdit = await requireAcceptedSetlistMember(supabase, setlistId, user.id)
  if (!canEdit) {
    return { status: "error", message: "You no longer have permission to manage this setlist." }
  }

  const { data, error } = await supabase.rpc("reorder_setlist_items", {
    p_setlist_id: setlistId,
    p_ordered_item_ids: orderedItemIds,
    p_expected_updated_at: expectedVersion,
  })

  if (error) {
    return { status: "error", message: "The order was not saved. Your previous order has been restored." }
  }

  const result = Array.isArray(data) ? data[0] : data
  if (result?.status === "conflict") {
    return {
      status: "conflict",
      message: "Someone changed this setlist first. Their latest order has been restored; try your move again.",
      version: result.new_updated_at ?? undefined,
    }
  }

  if (result?.status !== "success" || !result.new_updated_at) {
    return { status: "error", message: "The order was rejected and your previous order has been restored." }
  }

  revalidatePath("/setlists")
  revalidatePath(`/setlists/${setlistId}`)
  return {
    status: "success",
    message: "Order saved.",
    version: result.new_updated_at,
  }
}

export async function deleteSetlist(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const setlistId = Number(formData.get("setlist_id"))

  if (!setlistId || Number.isNaN(setlistId)) {
    redirect("/setlists?setlist=missing_setlist")
  }

  const { data: setlist, error: setlistError } = await supabase
    .from("setlists")
    .select("id, created_by")
    .eq("id", setlistId)
    .maybeSingle()

  if (setlistError) {
    throw new Error(setlistError.message)
  }

  if (!setlist) {
    redirect("/setlists?setlist=not_found")
  }

  if (setlist.created_by !== user.id) {
    redirect(`/setlists/${setlistId}?setlist=creator_only`)
  }

  const { error } = await supabase.from("setlists").delete().eq("id", setlistId)

  if (error) {
    redirect(`/setlists/${setlistId}?setlist=error`)
  }

  revalidatePath("/setlists")
  redirect("/setlists?setlist=deleted")
}

export async function searchSetlistTunes(input: { setlistId: number; query: string; page: number }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !Number.isSafeInteger(input.setlistId) || input.setlistId < 1 || !await requireAcceptedSetlistMember(supabase, input.setlistId, user.id)) {
    return { pieces: [], hasNext: false, error: "You no longer have permission to add tunes." }
  }
  const page = Number.isSafeInteger(input.page) ? Math.max(0, Math.min(5000, input.page)) : 0
  const query = String(input.query ?? "").trim().slice(0, 100).replace(/[\\%_]/g, "\\$&")
  let request = supabase.from("pieces").select("id, title, key, style").order("title").order("id")
  if (query) request = request.ilike("title", `%${query}%`)
  const { data, error } = await request.range(page * 20, page * 20 + 20)
  if (error) return { pieces: [], hasNext: false, error: "Tunes could not be loaded. Try again." }
  return { pieces: (data ?? []).slice(0, 20), hasNext: (data?.length ?? 0) > 20, error: null }
}
