import { loadRecentFriendActivity } from "@/lib/loaders/friends"
import {
  getBacklogTier,
  getBacklogTierLabel,
  isDueExactlyToday,
} from "@/lib/review"
import { reconcileStreaksForUser } from "@/lib/streaks"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type {
  BacklogGroupSummary,
  GettingStartedState,
  GettingStartedTask,
  HomeBadgePreview,
  HomeBadgeSummary,
  HomeListPreview,
  HomeSummaryData,
  HomeTunePreview,
  StreakSummary,
  UserPiece,
} from "@/lib/types"

type ConnectionRow = {
  id: number
  status: "pending" | "accepted"
  requester_id: string
  addressee_id: string
}

type HomepageProfileRow = {
  username: string | null
  display_name: string | null
}

type RepertoireSummaryRpcRow = {
  known_count: number | null
  practice_count: number | null
  due_today_count: number | null
  needs_attention_count: number | null
  list_count: number | null
  instrument_count: number | null
  review_event_count: number | null
}

type HomePracticeSummaryRow = UserPiece

type HomePracticePreviewRow = UserPiece & {
  pieces:
    | {
        id: number
        title: string
      }
    | {
        id: number
        title: string
      }[]
    | null
}

type HomeBadgeRow = {
  id: number
  name: string
  slug: string
  category: HomeBadgePreview["category"]
  created_at: string | null
}

type HomeBadgeAwardRow = {
  id: number
  awarded_at: string | null
  badges: HomeBadgeRow | HomeBadgeRow[] | null
}

function getJoinedPieceTitle(
  pieces:
    | {
        id: number
        title: string
      }
    | {
        id: number
        title: string
      }[]
    | null
) {
  if (!pieces) return "Untitled tune"

  const piece = Array.isArray(pieces) ? pieces[0] ?? null : pieces

  return piece?.title ?? "Untitled tune"
}

function toHomeTunePreview(row: HomePracticePreviewRow): HomeTunePreview {
  return {
    user_piece_id: row.id,
    piece_id: row.piece_id,
    title: getJoinedPieceTitle(row.pieces),
    stage: row.stage ?? 1,
  }
}

function sortPracticeSummaryRows(
  a: HomePracticeSummaryRow,
  b: HomePracticeSummaryRow
) {
  const aDue = a.next_review_due ?? "9999-12-31"
  const bDue = b.next_review_due ?? "9999-12-31"

  if (aDue !== bDue) {
    return aDue.localeCompare(bDue)
  }

  const aStage = a.stage ?? 999
  const bStage = b.stage ?? 999

  return aStage - bStage
}

function sortPracticePreviewRows(
  a: HomePracticePreviewRow,
  b: HomePracticePreviewRow
) {
  const aStage = a.stage ?? 999
  const bStage = b.stage ?? 999

  if (aStage !== bStage) {
    return aStage - bStage
  }

  const aTitle = getJoinedPieceTitle(a.pieces)
  const bTitle = getJoinedPieceTitle(b.pieces)

  return aTitle.localeCompare(bTitle)
}

function buildGettingStartedState(options: {
  profile: HomepageProfileRow | null
  instrumentCount: number
  practiceCount: number
  knownCount: number
  listCount: number
  dueTodayCount: number
  reviewEventCount: number
}): GettingStartedState {
  const totalInPractice = options.practiceCount
  const totalKnown = options.knownCount
  const totalUserTunes = totalInPractice + totalKnown
  const totalLists = options.listCount

  const hasCompleteProfile = Boolean(
    options.profile?.username &&
      options.profile?.display_name &&
      options.instrumentCount > 0
  )

  const hasAnyTuneState = totalUserTunes > 0
  const hasKnownTunes = totalKnown > 0
  const hasPracticeTunes = totalInPractice > 0
  const hasLists = totalLists > 0
  const hasCompletedReview = options.reviewEventCount > 0
  const hasFinishedToday = hasPracticeTunes && options.dueTodayCount === 0

  const tasks: GettingStartedTask[] = [
    {
      id: "complete_profile",
      group: "Set up your account",
      label: "Complete your profile",
      description:
        "Add your name, username, and at least one instrument so other musicians can recognise you.",
      href: "/dashboard",
      actionLabel: "Open Profile",
      pendingLabel: "Opening Profile...",
      isComplete: hasCompleteProfile,
    },
    {
      id: "add_tunes",
      group: "Set up your account",
      label: "Import or add your known tunes",
      description:
        "The fastest start is to import tunes you already know, or browse the catalogue and mark tunes as known.",
      href: "/library?import=known",
      actionLabel: "Import Known Tunes",
      pendingLabel: "Opening import...",
      isComplete: hasAnyTuneState,
    },
    {
      id: "create_list",
      group: "Set up your account",
      label: "Create your first list",
      description:
        "Use lists to organise tunes by session, gig, teacher, style, or learning goal.",
      href: "/learning-lists",
      actionLabel: "Open Lists",
      pendingLabel: "Opening Lists...",
      isComplete: hasLists,
    },
    {
      id: "mark_known",
      group: "Build repertoire state",
      label: "Mark a tune as known",
      description:
        "Known tunes count as part of your repertoire without putting them into active review.",
      href: "/library",
      actionLabel: "Find a Tune",
      pendingLabel: "Opening Tunes...",
      isComplete: hasKnownTunes,
    },
    {
      id: "start_practice",
      group: "Build repertoire state",
      label: "Start Practice on a tune",
      description:
        "Put one or two tunes into the practice system so the app can schedule review.",
      href: "/library",
      actionLabel: "Start Practice",
      pendingLabel: "Opening Tunes...",
      isComplete: hasPracticeTunes,
    },
    {
      id: "complete_first_review",
      group: "Learn the practice loop",
      label: "Complete your first review",
      description:
        "Review a due tune and choose Failed, Shaky, or Solid to move it through the schedule.",
      href: "/review",
      actionLabel: "Go to Practice",
      pendingLabel: "Opening Practice...",
      isComplete: hasCompletedReview,
    },
    {
      id: "finish_today",
      group: "Learn the practice loop",
      label: "Finish today’s due practice",
      description:
        "Clear anything due today so Home can show that your practice work is up to date.",
      href: "/review",
      actionLabel: "Review Due Tunes",
      pendingLabel: "Opening Practice...",
      isComplete: hasFinishedToday,
    },
  ]

  const completedCount = tasks.filter((task) => task.isComplete).length
  const totalCount = tasks.length

  const shouldShow =
    !hasCompleteProfile ||
    totalUserTunes < 5 ||
    !hasLists ||
    !hasCompletedReview

  return {
    shouldShow,
    completedCount,
    totalCount,
    nextTask: tasks.find((task) => !task.isComplete) ?? null,
    tasks,
  }
}

function getPreviewIds(rows: HomePracticeSummaryRow[], limit: number) {
  return rows.slice(0, limit).map((row) => row.id)
}

function getRepertoireSummaryRow(
  rows: RepertoireSummaryRpcRow[] | RepertoireSummaryRpcRow | null
): RepertoireSummaryRpcRow | null {
  if (!rows) return null
  return Array.isArray(rows) ? rows[0] ?? null : rows
}

function asSingleBadgeRow(
  value: HomeBadgeRow | HomeBadgeRow[] | null
): HomeBadgeRow | null {
  return Array.isArray(value) ? value[0] ?? null : value
}

function toHomeCreatedBadgePreview(row: HomeBadgeRow): HomeBadgePreview {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    created_at: row.created_at,
  }
}

function toHomeReceivedBadgePreview(
  row: HomeBadgeAwardRow
): HomeBadgePreview | null {
  const badge = asSingleBadgeRow(row.badges)

  if (!badge) {
    return null
  }

  return {
    id: badge.id,
    name: badge.name,
    slug: badge.slug,
    category: badge.category,
    awarded_at: row.awarded_at,
  }
}

async function loadHomeBadgeSummary({
  supabase,
  userId,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>
  userId: string
}): Promise<HomeBadgeSummary> {
  const [
    { count: receivedCount, error: receivedCountError },
    { count: createdCount, error: createdCountError },
    { data: receivedRows, error: receivedRowsError },
    { data: createdRows, error: createdRowsError },
  ] = await Promise.all([
    supabase
      .from("badge_awards")
      .select("id", { count: "exact", head: true })
      .eq("recipient_user_id", userId),

    supabase
      .from("badges")
      .select("id", { count: "exact", head: true })
      .eq("owner_user_id", userId),

    supabase
      .from("badge_awards")
      .select(
        `
          id,
          awarded_at,
          badges (
            id,
            name,
            slug,
            category,
            created_at
          )
        `
      )
      .eq("recipient_user_id", userId)
      .order("awarded_at", { ascending: false })
      .limit(3),

    supabase
      .from("badges")
      .select("id, name, slug, category, created_at")
      .eq("owner_user_id", userId)
      .order("created_at", { ascending: false })
      .limit(3),
  ])

  if (receivedCountError) throw new Error(receivedCountError.message)
  if (createdCountError) throw new Error(createdCountError.message)
  if (receivedRowsError) throw new Error(receivedRowsError.message)
  if (createdRowsError) throw new Error(createdRowsError.message)

  return {
    receivedCount: receivedCount ?? 0,
    createdCount: createdCount ?? 0,
    recentReceivedBadges: ((receivedRows ?? []) as HomeBadgeAwardRow[])
      .map(toHomeReceivedBadgePreview)
      .filter((badge): badge is HomeBadgePreview => Boolean(badge)),
    recentCreatedBadges: ((createdRows ?? []) as HomeBadgeRow[]).map(
      toHomeCreatedBadgePreview
    ),
  }
}

export async function loadHomepageData() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const streakSummary: StreakSummary = await reconcileStreaksForUser(
    supabase,
    user.id
  )

  const [
    { data: profile, error: profileError },
    { data: repertoireSummaryRows, error: repertoireSummaryError },
    { data: listPreviewRows, error: listPreviewError },
    { data: practiceSummaryRows, error: practiceSummaryError },
    { data: connectionRows, error: connectionError },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("username, display_name")
      .eq("id", user.id)
      .maybeSingle(),

    supabase.rpc("get_my_repertoire_summary"),

    supabase
      .from("learning_lists")
      .select("id, name")
      .eq("user_id", user.id)
      .order("id", { ascending: false })
      .limit(3),

    supabase
      .from("user_pieces")
      .select("id, piece_id, status, next_review_due, stage")
      .eq("user_id", user.id)
      .eq("status", "learning"),

    supabase
      .from("connections")
      .select("id, status, requester_id, addressee_id")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`),
  ])

  if (profileError) {
    throw new Error(profileError.message)
  }

  if (repertoireSummaryError) {
    throw new Error(repertoireSummaryError.message)
  }

  if (listPreviewError) {
    throw new Error(listPreviewError.message)
  }

  if (practiceSummaryError) {
    throw new Error(practiceSummaryError.message)
  }

  if (connectionError) {
    throw new Error(connectionError.message)
  }

  const repertoireSummary = getRepertoireSummaryRow(
    repertoireSummaryRows as
      | RepertoireSummaryRpcRow[]
      | RepertoireSummaryRpcRow
      | null
  )

  const safeKnownCount = repertoireSummary?.known_count ?? 0
  const safeListCount = repertoireSummary?.list_count ?? 0
  const safeInstrumentCount = repertoireSummary?.instrument_count ?? 0
  const safeReviewEventCount = repertoireSummary?.review_event_count ?? 0

  const typedPracticeSummaryRows =
    (practiceSummaryRows ?? []) as HomePracticeSummaryRow[]

  const practiceCount =
    repertoireSummary?.practice_count ?? typedPracticeSummaryRows.length

  const dueTodayRows = typedPracticeSummaryRows
    .filter((userPiece) => isDueExactlyToday(userPiece.next_review_due))
    .sort(sortPracticeSummaryRows)

  const dueTodayCount = repertoireSummary?.due_today_count ?? dueTodayRows.length

  const backlogSummary: BacklogGroupSummary[] = [
    {
      tier: "due_now",
      label: getBacklogTierLabel("due_now"),
      count: typedPracticeSummaryRows.filter(
        (userPiece) => getBacklogTier(userPiece.next_review_due) === "due_now"
      ).length,
    },
    {
      tier: "overdue",
      label: getBacklogTierLabel("overdue"),
      count: typedPracticeSummaryRows.filter(
        (userPiece) => getBacklogTier(userPiece.next_review_due) === "overdue"
      ).length,
    },
    {
      tier: "overdue_longest",
      label: getBacklogTierLabel("overdue_longest"),
      count: typedPracticeSummaryRows.filter(
        (userPiece) =>
          getBacklogTier(userPiece.next_review_due) === "overdue_longest"
      ).length,
    },
  ]

  const needsAttentionCount =
    repertoireSummary?.needs_attention_count ??
    backlogSummary.reduce((sum, group) => sum + group.count, 0)

  const sortedPracticeRows = [...typedPracticeSummaryRows].sort(
    sortPracticeSummaryRows
  )

  const previewUserPieceIds = Array.from(
    new Set([
      ...getPreviewIds(dueTodayRows, 3),
      ...getPreviewIds(sortedPracticeRows, 3),
    ])
  )

  let previewRows: HomePracticePreviewRow[] = []

  if (previewUserPieceIds.length > 0) {
    const { data: previewData, error: previewError } = await supabase
      .from("user_pieces")
      .select(
        `
        id,
        piece_id,
        status,
        next_review_due,
        stage,
        pieces (
          id,
          title
        )
      `
      )
      .eq("user_id", user.id)
      .in("id", previewUserPieceIds)

    if (previewError) {
      throw new Error(previewError.message)
    }

    previewRows = (previewData ?? []) as HomePracticePreviewRow[]
  }

  const previewRowsById = new Map(previewRows.map((row) => [row.id, row]))

  const dueTodayPreview = dueTodayRows
    .slice(0, 3)
    .map((row) => previewRowsById.get(row.id))
    .filter((row): row is HomePracticePreviewRow => Boolean(row))
    .sort(sortPracticePreviewRows)
    .map(toHomeTunePreview)

  const inPracticePreview = sortedPracticeRows
    .slice(0, 3)
    .map((row) => previewRowsById.get(row.id))
    .filter((row): row is HomePracticePreviewRow => Boolean(row))
    .sort(sortPracticePreviewRows)
    .map(toHomeTunePreview)

  const listPreview: HomeListPreview[] = (listPreviewRows ?? []).map(
    (list) => ({
      id: list.id,
      name: list.name,
    })
  )

  const acceptedFriendIds = ((connectionRows ?? []) as ConnectionRow[])
    .filter((row) => row.status === "accepted")
    .map((row) =>
      row.requester_id === user.id ? row.addressee_id : row.requester_id
    )

  const [recentFriendActivity, reviewEventResult, badgeSummary] =
    await Promise.all([
      loadRecentFriendActivity(supabase, acceptedFriendIds, user.id, 5),

      typedPracticeSummaryRows.length > 0
        ? supabase
            .from("review_events")
            .select("id", { count: "exact", head: true })
            .in(
              "user_piece_id",
              typedPracticeSummaryRows.map((userPiece) => userPiece.id)
            )
        : Promise.resolve({ count: 0, error: null }),

      loadHomeBadgeSummary({
        supabase,
        userId: user.id,
      }),
    ])

  if (reviewEventResult.error) {
    throw new Error(reviewEventResult.error.message)
  }

  const reviewEventCount = safeReviewEventCount || reviewEventResult.count || 0

  const gettingStartedState = buildGettingStartedState({
    profile: (profile ?? null) as HomepageProfileRow | null,
    instrumentCount: safeInstrumentCount,
    practiceCount,
    knownCount: safeKnownCount,
    listCount: safeListCount,
    dueTodayCount,
    reviewEventCount,
  })

  const summary: HomeSummaryData = {
    knownCount: safeKnownCount,
    practiceCount,
    dueTodayCount,
    needsAttentionCount,
    listCount: safeListCount,
    badgeSummary,
    dueTodayPreview,
    inPracticePreview,
    listPreview,
  }

  return {
    user,
    summary,
    recentFriendActivity,
    streakSummary,
    gettingStartedState,
  }
}