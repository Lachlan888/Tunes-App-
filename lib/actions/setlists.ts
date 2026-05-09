"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import {
  notifySetlistMembers,
  notifySingleUser,
} from "@/lib/services/setlist-notifications"
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

async function getNextPosition(
  supabase: SupabaseServerClient,
  setlistId: number
) {
  const { data, error } = await supabase
    .from("setlist_items")
    .select("position")
    .eq("setlist_id", setlistId)
    .order("position", { ascending: false })
    .limit(1)

  if (error) {
    throw new Error(error.message)
  }

  const lastPosition = data?.[0]?.position
  return typeof lastPosition === "number" ? lastPosition + 1 : 1
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
  redirect(`/setlists/${setlist.id}?setlist=created`)
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

  const { error } = await supabase
    .from("setlists")
    .update({
      name,
      description: description || null,
      event_date: eventDate || null,
      location: location || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", setlistId)

  if (error) {
    redirect(appendQueryParam(redirectTo, "setlist", "error"))
  }

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

  const { data: existingItem, error: existingError } = await supabase
    .from("setlist_items")
    .select("id")
    .eq("setlist_id", setlistId)
    .eq("piece_id", pieceId)
    .maybeSingle()

  if (existingError) {
    throw new Error(existingError.message)
  }

  if (existingItem) {
    redirect(appendQueryParam(redirectTo, "setlist_item", "duplicate"))
  }

  const nextPosition = await getNextPosition(supabase, setlistId)

  const { data: insertedItem, error: insertError } = await supabase
    .from("setlist_items")
    .insert({
      setlist_id: setlistId,
      piece_id: pieceId,
      position: nextPosition,
      added_by: user.id,
    })
    .select("id")
    .single()

  if (insertError || !insertedItem) {
    redirect(appendQueryParam(redirectTo, "setlist_item", "error"))
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
    setlistItemId: insertedItem.id,
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
  const performanceKey = String(formData.get("performance_key") ?? "").trim()
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

  const { error } = await supabase
    .from("setlist_items")
    .update({
      performance_key: performanceKey || null,
      notes: notes || null,
      chart_url: chartUrl || null,
      chart_label: chartLabel || null,
      chart_type: chartType || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", itemId)
    .eq("setlist_id", setlistId)

  if (error) {
    redirect(appendQueryParam(redirectTo, "setlist_item", "error"))
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

  const { error } = await supabase
    .from("setlist_items")
    .delete()
    .eq("id", itemId)
    .eq("setlist_id", setlistId)

  if (error) {
    redirect(appendQueryParam(redirectTo, "setlist_item", "error"))
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

  const currentItem = typedItems[currentIndex]
  const targetItem = typedItems[targetIndex]

  const { error: currentUpdateError } = await supabase
    .from("setlist_items")
    .update({ position: targetItem.position })
    .eq("id", currentItem.id)

  if (currentUpdateError) {
    redirect(appendQueryParam(redirectTo, "setlist_item", "error"))
  }

  const { error: targetUpdateError } = await supabase
    .from("setlist_items")
    .update({ position: currentItem.position })
    .eq("id", targetItem.id)

  if (targetUpdateError) {
    redirect(appendQueryParam(redirectTo, "setlist_item", "error"))
  }

  revalidatePath(`/setlists/${setlistId}`)
  redirect(appendQueryParam(redirectTo, "setlist_item", "moved"))
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