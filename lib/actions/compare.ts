"use server"

import { redirect } from "next/navigation"
import { loadCompareData } from "@/lib/loaders/compare"
import { createClient } from "@/lib/supabase/server"

export async function createSetlistFromComparison(formData: FormData) {
  const confirmed = formData.get("confirm_private") === "yes"
  const usernames = formData
    .getAll("compare_user")
    .map(String)
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 5)
  const pieceIds = Array.from(
    new Set(
      formData
        .getAll("piece_id")
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0)
    )
  ).slice(0, 12)
  const name = String(formData.get("name") ?? "Session tunes").trim().slice(0, 80)

  if (!confirmed || usernames.length === 0 || pieceIds.length === 0 || !name) {
    redirect("/compare?setlist=invalid")
  }

  const comparison = await loadCompareData(usernames, { includePractice: true })
  const allowedIds = new Set(comparison.outcomeGroups.playableTogetherIds)
  if (!comparison.canCompare || pieceIds.some((pieceId) => !allowedIds.has(pieceId))) {
    redirect("/compare?setlist=forbidden")
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: setlist, error: setlistError } = await supabase
    .from("setlists")
    .insert({
      name,
      description: "Private session set created from a repertoire comparison.",
      created_by: user.id,
    })
    .select("id")
    .single()

  if (setlistError || !setlist) redirect("/compare?setlist=error")

  const { error: memberError } = await supabase.from("setlist_members").insert({
    setlist_id: setlist.id,
    user_id: user.id,
    status: "accepted",
    invited_by: user.id,
    responded_at: new Date().toISOString(),
  })

  const { error: itemError } = memberError
    ? { error: memberError }
    : await supabase.from("setlist_items").insert(
        pieceIds.map((pieceId, index) => ({
          setlist_id: setlist.id,
          piece_id: pieceId,
          position: index + 1,
          added_by: user.id,
        }))
      )

  if (memberError || itemError) {
    await supabase.from("setlists").delete().eq("id", setlist.id).eq("created_by", user.id)
    redirect("/compare?setlist=error")
  }

  redirect(`/setlists/${setlist.id}?setlist=created_from_compare`)
}
