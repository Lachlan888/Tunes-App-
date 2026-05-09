import {
  calculateBadgeProgress,
  normaliseBadgeConditionLogic,
  summariseBadgeConditionLogic,
} from "@/lib/badges/conditions"
import { autoAwardBadgeIfEligible } from "@/lib/services/badge-awards"
import { createClient } from "@/lib/supabase/server"
import type {
  Badge,
  BadgeAward,
  BadgeAwardWithProfiles,
  BadgeDetailData,
  BadgeIndexData,
  BadgeOwnerProfile,
  BadgeWithOwner,
  LearningList,
  Piece,
  StyleOption,
} from "@/lib/types"

type BadgeRow = Omit<Badge, "condition_logic"> & {
  condition_logic: unknown
}

type BadgeAwardRow = BadgeAward

type ProfileRow = {
  id: string
  username: string | null
  display_name: string | null
}

type CreateBadgeListOption = LearningList & {
  user_id: string
}

export type CreateBadgeData = {
  viewerId: string
  publicLists: CreateBadgeListOption[]
  pieces: Piece[]
  styleOptions: StyleOption[]
  keyOptions: string[]
  timeSignatureOptions: string[]
}

export type EditBadgeData =
  | {
      status: "not_found" | "not_owner"
      viewerId: string
      badge: null
      publicLists: CreateBadgeListOption[]
      pieces: Piece[]
      styleOptions: StyleOption[]
      keyOptions: string[]
      timeSignatureOptions: string[]
      awardCount: number
    }
  | {
      status: "loaded"
      viewerId: string
      badge: Badge
      publicLists: CreateBadgeListOption[]
      pieces: Piece[]
      styleOptions: StyleOption[]
      keyOptions: string[]
      timeSignatureOptions: string[]
      awardCount: number
    }

function profileDisplayName(profile: BadgeOwnerProfile | null) {
  if (!profile) return "Unknown user"
  return profile.display_name || profile.username || "Unknown user"
}

function mapProfile(
  row: ProfileRow | BadgeOwnerProfile | null | undefined
): BadgeOwnerProfile | null {
  if (!row) return null

  return {
    id: row.id,
    username: row.username,
    display_name: row.display_name,
  }
}

async function loadProfilesByUserId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userIds: string[]
) {
  const uniqueUserIds = Array.from(new Set(userIds)).filter(Boolean)

  if (uniqueUserIds.length === 0) {
    return new Map<string, BadgeOwnerProfile>()
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .in("id", uniqueUserIds)

  if (error) {
    throw new Error(error.message)
  }

  const profileMap = new Map<string, BadgeOwnerProfile>()

  for (const row of (data ?? []) as ProfileRow[]) {
    profileMap.set(row.id, {
      id: row.id,
      username: row.username,
      display_name: row.display_name,
    })
  }

  return profileMap
}

function mapBadgeRow(row: BadgeRow): Badge {
  return {
    ...row,
    condition_logic: normaliseBadgeConditionLogic(row.condition_logic),
  }
}

async function loadBadgeFormOptions({
  supabase,
  userId,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>
  userId: string
}) {
  const [
    { data: publicListRows, error: publicListsError },
    { data: pieceRows, error: piecesError },
    { data: styleRows, error: stylesError },
  ] = await Promise.all([
    supabase
      .from("learning_lists")
      .select("id, user_id, name, description, visibility, is_imported")
      .eq("visibility", "public")
      .order("name", { ascending: true }),

    supabase
      .from("pieces")
      .select("id, title, key, style, time_signature, reference_url")
      .order("title", { ascending: true })
      .limit(500),

    supabase
      .from("styles")
      .select("id, slug, label")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("label", { ascending: true }),
  ])

  if (publicListsError) {
    throw new Error(publicListsError.message)
  }

  if (piecesError) {
    throw new Error(piecesError.message)
  }

  if (stylesError) {
    throw new Error(stylesError.message)
  }

  const pieces = ((pieceRows ?? []) as Piece[]) ?? []

  const keyOptions = Array.from(
    new Set(
      pieces
        .map((piece) => piece.key)
        .filter((key): key is string => Boolean(key))
    )
  ).sort((a, b) => a.localeCompare(b))

  const timeSignatureOptions = Array.from(
    new Set(
      pieces
        .map((piece) => piece.time_signature)
        .filter((timeSignature): timeSignature is string =>
          Boolean(timeSignature)
        )
    )
  ).sort((a, b) => a.localeCompare(b))

  return {
    viewerId: userId,
    publicLists: ((publicListRows ?? []) as CreateBadgeListOption[]) ?? [],
    pieces,
    styleOptions: ((styleRows ?? []) as StyleOption[]) ?? [],
    keyOptions,
    timeSignatureOptions,
  }
}

async function attachBadgeDisplayData({
  supabase,
  badges,
  viewerId,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>
  badges: Badge[]
  viewerId: string | null
}): Promise<BadgeWithOwner[]> {
  if (badges.length === 0) {
    return []
  }

  const badgeIds = badges.map((badge) => badge.id)
  const ownerIds = badges.map((badge) => badge.owner_user_id)
  const ownerProfiles = await loadProfilesByUserId(supabase, ownerIds)

  const { data: awardRows, error: awardsError } = await supabase
    .from("badge_awards")
    .select(
      "id, badge_id, recipient_user_id, awarded_by_user_id, award_note, awarded_at"
    )
    .in("badge_id", badgeIds)

  if (awardsError) {
    throw new Error(awardsError.message)
  }

  const awards = ((awardRows ?? []) as BadgeAwardRow[]) ?? []
  const awardsByBadgeId = new Map<number, BadgeAwardRow[]>()

  for (const award of awards) {
    const existing = awardsByBadgeId.get(award.badge_id) ?? []
    awardsByBadgeId.set(award.badge_id, [...existing, award])
  }

  return Promise.all(
    badges.map(async (badge) => {
      const badgeAwards = awardsByBadgeId.get(badge.id) ?? []

      const existingViewerAward =
        viewerId !== null
          ? badgeAwards.find((award) => award.recipient_user_id === viewerId) ??
            null
          : null

      const viewerProgress =
        viewerId !== null
          ? await calculateBadgeProgress({
              supabase,
              userId: viewerId,
              conditionLogic: badge.condition_logic,
            })
          : null

      const viewerAward =
        viewerId !== null && viewerProgress?.isEligible
          ? await autoAwardBadgeIfEligible({
              supabase,
              userId: viewerId,
              badge,
              existingAward: existingViewerAward,
            })
          : existingViewerAward

      const didCreateViewerAward =
        viewerAward !== null &&
        existingViewerAward === null &&
        viewerAward.recipient_user_id === viewerId

      return {
        ...badge,
        owner_profile: ownerProfiles.get(badge.owner_user_id) ?? null,
        recipient_count: badgeAwards.length + (didCreateViewerAward ? 1 : 0),
        viewer_award: viewerAward,
        viewer_progress: viewerProgress,
        condition_summary: summariseBadgeConditionLogic(badge.condition_logic),
      }
    })
  )
}

export async function loadBadgeIndexData(): Promise<BadgeIndexData> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const viewerId = user?.id ?? null

  const { data: badgeRows, error: badgeError } = await supabase
    .from("badges")
    .select(
      `
        id,
        owner_user_id,
        name,
        slug,
        description,
        commentary,
        category,
        visibility,
        awarding_mode,
        condition_logic,
        created_at,
        updated_at
      `
    )
    .in("visibility", ["public", "unlisted"])
    .order("created_at", { ascending: false })

  if (badgeError) {
    throw new Error(badgeError.message)
  }

  const badges = ((badgeRows ?? []) as BadgeRow[]).map((row) => mapBadgeRow(row))

  return {
    viewerId,
    badges: await attachBadgeDisplayData({
      supabase,
      badges,
      viewerId,
    }),
  }
}

export async function loadBadgeDetailData(
  slug: string
): Promise<BadgeDetailData> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const viewerId = user?.id ?? null

  const { data: badgeRow, error: badgeError } = await supabase
    .from("badges")
    .select(
      `
        id,
        owner_user_id,
        name,
        slug,
        description,
        commentary,
        category,
        visibility,
        awarding_mode,
        condition_logic,
        created_at,
        updated_at
      `
    )
    .eq("slug", slug)
    .maybeSingle()

  if (badgeError) {
    throw new Error(badgeError.message)
  }

  if (!badgeRow) {
    return {
      status: "not_found",
      viewerId,
    }
  }

  const badge = mapBadgeRow(badgeRow as BadgeRow)

  const [badgeWithOwner] = await attachBadgeDisplayData({
    supabase,
    badges: [badge],
    viewerId,
  })

  const { data: awardRows, error: awardsError } = await supabase
    .from("badge_awards")
    .select(
      "id, badge_id, recipient_user_id, awarded_by_user_id, award_note, awarded_at"
    )
    .eq("badge_id", badge.id)
    .order("awarded_at", { ascending: false })

  if (awardsError) {
    throw new Error(awardsError.message)
  }

  const awards = ((awardRows ?? []) as BadgeAwardRow[]) ?? []
  const profileIds = awards.flatMap((award) => [
    award.recipient_user_id,
    award.awarded_by_user_id,
  ])

  const profileMap = await loadProfilesByUserId(supabase, profileIds)

  const awardsWithProfiles: BadgeAwardWithProfiles[] = awards.map((award) => ({
    ...award,
    recipient_profile: mapProfile(profileMap.get(award.recipient_user_id)),
    awarded_by_profile: mapProfile(profileMap.get(award.awarded_by_user_id)),
  }))

  return {
    status: "loaded",
    viewerId,
    badge: {
      ...badgeWithOwner,
      condition_summary: badgeWithOwner.condition_summary.replace(
        "a selected list",
        `${profileDisplayName(badgeWithOwner.owner_profile)}'s selected list`
      ),
    },
    awards: awardsWithProfiles,
  }
}

export async function loadCreateBadgeData(): Promise<CreateBadgeData> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  return loadBadgeFormOptions({
    supabase,
    userId: user.id,
  })
}

export async function loadEditBadgeData(slug: string): Promise<EditBadgeData> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const formOptions = await loadBadgeFormOptions({
    supabase,
    userId: user.id,
  })

  const { data: badgeRow, error: badgeError } = await supabase
    .from("badges")
    .select(
      `
        id,
        owner_user_id,
        name,
        slug,
        description,
        commentary,
        category,
        visibility,
        awarding_mode,
        condition_logic,
        created_at,
        updated_at
      `
    )
    .eq("slug", slug)
    .maybeSingle()

  if (badgeError) {
    throw new Error(badgeError.message)
  }

  if (!badgeRow) {
    return {
      ...formOptions,
      status: "not_found",
      badge: null,
      awardCount: 0,
    }
  }

  const badge = mapBadgeRow(badgeRow as BadgeRow)

  if (badge.owner_user_id !== user.id) {
    return {
      ...formOptions,
      status: "not_owner",
      badge: null,
      awardCount: 0,
    }
  }

  const { count, error: awardCountError } = await supabase
    .from("badge_awards")
    .select("id", { count: "exact", head: true })
    .eq("badge_id", badge.id)

  if (awardCountError) {
    throw new Error(awardCountError.message)
  }

  return {
    ...formOptions,
    status: "loaded",
    badge,
    awardCount: count ?? 0,
  }
}