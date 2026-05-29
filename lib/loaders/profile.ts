import { requireUserContext } from "@/lib/auth/session"
import type {
  NotificationPreferences,
  OwnProfileData,
  Profile,
  UserInstrument,
} from "@/lib/types"
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/lib/types"

function withDefaultNotificationPreferences(
  userId: string,
  preferences: Partial<NotificationPreferences> | null
): NotificationPreferences {
  return {
    user_id: userId,
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...(preferences ?? {}),
  }
}

export async function loadOwnProfileData(): Promise<OwnProfileData> {
  const { supabase, user } = await requireUserContext()

  const [
    { data: profile, error: profileError },
    { data: notificationPreferences, error: notificationPreferencesError },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        `
        id,
        username,
        display_name,
        bio,
        role,
        show_identity,
        show_instruments,
        show_public_lists_on_profile,
        show_composed_tunes_on_profile,
        show_repertoire_summary,
        show_repertoire_to_friends,
        show_comment_activity,
        show_compare_discoverability,
        compare_requires_friend,
        practice_diary_enabled
      `
      )
      .eq("id", user.id)
      .maybeSingle(),

    supabase
      .from("notification_preferences")
      .select(
        `
          user_id,
          email_enabled,
          email_friend_requests,
          email_direct_messages,
          email_comment_replies,
          email_setlist_invites,
          email_badges,
          email_activity_replies,
          email_practice_reminders,
          email_weekly_summary,
          email_public_list_activity,
          email_product_updates,
          digest_frequency,
          created_at,
          updated_at
        `
      )
      .eq("user_id", user.id)
      .maybeSingle(),
  ])

  if (profileError) {
    throw new Error(profileError.message)
  }

  if (notificationPreferencesError) {
    throw new Error(notificationPreferencesError.message)
  }

  const { data: instruments, error: instrumentsError } = await supabase
    .from("user_instruments")
    .select("id, instrument_name, position")
    .eq("user_id", user.id)
    .order("position", { ascending: true })
    .order("id", { ascending: true })

  if (instrumentsError) {
    throw new Error(instrumentsError.message)
  }

  return {
    user: {
      id: user.id,
      email: user.email ?? null,
    },
    profile: (profile ?? null) as Profile | null,
    notificationPreferences: withDefaultNotificationPreferences(
      user.id,
      (notificationPreferences as Partial<NotificationPreferences> | null) ??
        null
    ),
    instruments: (instruments ?? []) as UserInstrument[],
  }
}
