import {
  calculateBadgeProgress,
  normaliseBadgeConditionLogic,
} from "@/lib/badges/conditions"
import { createClient } from "@/lib/supabase/server"
import type { Badge, BadgeAward, BadgeConditionLogic } from "@/lib/types"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

type AutoAwardBadgeInput = {
  supabase: SupabaseServerClient
  userId: string
  badge: Pick<
    Badge,
    | "id"
    | "name"
    | "owner_user_id"
    | "awarding_mode"
    | "visibility"
    | "condition_logic"
  >
  existingAward: BadgeAward | null
}

type BadgeAwardRow = BadgeAward

async function createBadgeAwardNotification({
  supabase,
  badge,
  recipientUserId,
}: {
  supabase: SupabaseServerClient
  badge: Pick<Badge, "id" | "name" | "owner_user_id">
  recipientUserId: string
}) {
  if (recipientUserId === badge.owner_user_id) {
    return
  }

  const { error } = await supabase.from("user_notifications").insert({
    recipient_user_id: recipientUserId,
    actor_user_id: badge.owner_user_id,
    notification_type: "badge_awarded",
    badge_id: badge.id,
    body_preview: `You received the badge “${badge.name}”.`,
  })

  if (error) {
    console.error("Error creating badge award notification:", {
      badgeId: badge.id,
      recipientUserId,
      error,
    })
  }
}

export async function autoAwardBadgeIfEligible({
  supabase,
  userId,
  badge,
  existingAward,
}: AutoAwardBadgeInput): Promise<BadgeAward | null> {
  if (existingAward) {
    return existingAward
  }

  if (badge.visibility !== "public") {
    return null
  }

  if (badge.awarding_mode !== "auto_when_eligible") {
    return null
  }

  const conditionLogic: BadgeConditionLogic = normaliseBadgeConditionLogic(
    badge.condition_logic
  )

  const progress = await calculateBadgeProgress({
    supabase,
    userId,
    conditionLogic,
  })

  if (!progress.isEligible) {
    return null
  }

  const { data: insertedAward, error: insertError } = await supabase
    .from("badge_awards")
    .insert({
      badge_id: badge.id,
      recipient_user_id: userId,
      awarded_by_user_id: badge.owner_user_id,
    })
    .select(
      "id, badge_id, recipient_user_id, awarded_by_user_id, award_note, awarded_at"
    )
    .single()

  if (insertError) {
    if (insertError.code === "23505") {
      const { data: existingAwardRow, error: existingAwardError } =
        await supabase
          .from("badge_awards")
          .select(
            "id, badge_id, recipient_user_id, awarded_by_user_id, award_note, awarded_at"
          )
          .eq("badge_id", badge.id)
          .eq("recipient_user_id", userId)
          .maybeSingle()

      if (existingAwardError) {
        throw new Error(existingAwardError.message)
      }

      return (existingAwardRow as BadgeAwardRow | null) ?? null
    }

    throw new Error(insertError.message)
  }

  const award = insertedAward as BadgeAwardRow

  await createBadgeAwardNotification({
    supabase,
    badge,
    recipientUserId: userId,
  })

  return award
}