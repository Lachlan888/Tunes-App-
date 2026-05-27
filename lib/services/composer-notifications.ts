import { createClient } from "@/lib/supabase/server"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

type ComposerNotificationPiece = {
  id: number
  title: string
}

type ProfileRow = {
  id: string
  username: string | null
  display_name: string | null
}

function profileLabel(profile: ProfileRow | null) {
  return profile?.display_name || profile?.username || "Someone"
}

export async function notifyComposerAttributionAdded({
  supabase,
  recipientUserId,
  actorUserId,
  piece,
}: {
  supabase: SupabaseServerClient
  recipientUserId: string
  actorUserId: string
  piece: ComposerNotificationPiece
}) {
  const { error } = await supabase.from("user_notifications").insert({
    recipient_user_id: recipientUserId,
    actor_user_id: actorUserId,
    notification_type: "composer_attribution_added",
    piece_id: piece.id,
    body_preview: `You were tagged as the composer of “${piece.title}”.`,
  })

  if (error) {
    console.error("Error creating composer attribution notification:", error)
  }
}

export async function notifyComposerTuneStartedPractice({
  supabase,
  composerUserId,
  learnerUserId,
  piece,
}: {
  supabase: SupabaseServerClient
  composerUserId: string | null | undefined
  learnerUserId: string
  piece: ComposerNotificationPiece
}) {
  if (!composerUserId || composerUserId === learnerUserId) {
    return
  }

  const { data: learnerProfile, error: learnerProfileError } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .eq("id", learnerUserId)
    .maybeSingle()

  if (learnerProfileError) {
    console.error("Error loading learner profile for composer notification:", learnerProfileError)
  }

  const actorName = profileLabel((learnerProfile as ProfileRow | null) ?? null)

  const { error } = await supabase.from("user_notifications").insert({
    recipient_user_id: composerUserId,
    actor_user_id: learnerUserId,
    notification_type: "composer_tune_started_practice",
    piece_id: piece.id,
    body_preview: `${actorName} started practising your tune “${piece.title}”.`,
  })

  if (error) {
    console.error("Error creating composer practice notification:", error)
  }
}
