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
  LearningList,
  Piece,
  StreakSummary,
  UserKnownPiece,
  UserPiece,
} from "@/lib/types"

type LearningListItem = {
  id: number
  position: number | null
  pieces: Piece | Piece[] | null
}

type LearningListWithItems = LearningList & {
  learning_list_items: LearningListItem[]
}

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

function buildGettingStartedState(options: {
  profile: HomepageProfileRow | null
  instrumentCount: number
  userPieces: UserPiece[]
  userKnownPieces: UserKnownPiece[]
  learningLists: LearningListWithItems[]
  dueToday: UserPiece[]
  reviewEventCount: number
}): GettingStartedState {
  const totalInPractice = options.userPieces.length
  const totalKnown = options.userKnownPieces.length
  const totalUserTunes = totalInPractice + totalKnown
  const totalLists = options.learningLists.length

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
  const hasFinishedToday =
    hasPracticeTunes && options.dueToday.length === 0

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

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("username, display_name")
    .eq("id", user.id)
    .maybeSingle()

  if (profileError) {
    throw new Error(profileError.message)
  }

  const { count: instrumentCount, error: instrumentCountError } = await supabase
    .from("user_instruments")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)

  if (instrumentCountError) {
    throw new Error(instrumentCountError.message)
  }

  const { data: learningLists, error: learningListsError } = await supabase
    .from("learning_lists")
    .select(`
      id,
      name,
      description,
      learning_list_items (
        id,
        position,
        pieces (
          id,
          title,
          key,
          style,
          time_signature,
          reference_url,
          piece_styles (
            style_id,
            styles (
              id,
              slug,
              label
            )
          )
        )
      )
    `)
    .eq("user_id", user.id)

  if (learningListsError) {
    throw new Error(learningListsError.message)
  }

  const { data: pieces, error: piecesError } = await supabase
    .from("pieces")
    .select(`
      id,
      title,
      key,
      style,
      time_signature,
      reference_url,
      piece_styles (
        style_id,
        styles (
          id,
          slug,
          label
        )
      )
    `)
    .order("title")

  if (piecesError) {
    throw new Error(piecesError.message)
  }

  const { data: userPieces, error: userPiecesError } = await supabase
    .from("user_pieces")
    .select("id, piece_id, status, next_review_due, stage")
    .eq("user_id", user.id)

  if (userPiecesError) {
    throw new Error(userPiecesError.message)
  }

  const { data: userKnownPieces, error: userKnownPiecesError } = await supabase
    .from("user_known_pieces")
    .select("id, piece_id")
    .eq("user_id", user.id)

  if (userKnownPiecesError) {
    throw new Error(userKnownPiecesError.message)
  }

  const { data: connectionRows, error: connectionError } = await supabase
    .from("connections")
    .select("id, status, requester_id, addressee_id")
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)

  if (connectionError) {
    throw new Error(connectionError.message)
  }

  const acceptedFriendIds = ((connectionRows ?? []) as ConnectionRow[])
    .filter((row) => row.status === "accepted")
    .map((row) =>
      row.requester_id === user.id ? row.addressee_id : row.requester_id
    )

  const recentFriendActivity = await loadRecentFriendActivity(
    supabase,
    acceptedFriendIds,
    5
  )

  const typedUserPieces = (userPieces ?? []) as UserPiece[]

  const userPieceIds = typedUserPieces.map((userPiece) => userPiece.id)

  let reviewEventCount = 0

  if (userPieceIds.length > 0) {
    const { count, error: reviewEventCountError } = await supabase
      .from("review_events")
      .select("id", { count: "exact", head: true })
      .in("user_piece_id", userPieceIds)

    if (reviewEventCountError) {
      throw new Error(reviewEventCountError.message)
    }

    reviewEventCount = count ?? 0
  }

  const dueToday = typedUserPieces.filter((userPiece) =>
    isDueExactlyToday(userPiece.next_review_due)
  )

  const backlogSummary: BacklogGroupSummary[] = [
    {
      tier: "due_now",
      label: getBacklogTierLabel("due_now"),
      count: typedUserPieces.filter(
        (userPiece) => getBacklogTier(userPiece.next_review_due) === "due_now"
      ).length,
    },
    {
      tier: "overdue",
      label: getBacklogTierLabel("overdue"),
      count: typedUserPieces.filter(
        (userPiece) => getBacklogTier(userPiece.next_review_due) === "overdue"
      ).length,
    },
    {
      tier: "overdue_longest",
      label: getBacklogTierLabel("overdue_longest"),
      count: typedUserPieces.filter(
        (userPiece) =>
          getBacklogTier(userPiece.next_review_due) === "overdue_longest"
      ).length,
    },
  ]

  const needsAttentionCount = backlogSummary.reduce(
    (sum, group) => sum + group.count,
    0
  )

  const typedLearningLists =
    (learningLists ?? []) as LearningListWithItems[]

  const typedUserKnownPieces =
    (userKnownPieces ?? []) as UserKnownPiece[]

  const gettingStartedState = buildGettingStartedState({
    profile: (profile ?? null) as HomepageProfileRow | null,
    instrumentCount: instrumentCount ?? 0,
    userPieces: typedUserPieces,
    userKnownPieces: typedUserKnownPieces,
    learningLists: typedLearningLists,
    dueToday,
    reviewEventCount,
  })

  return {
    user,
    learningLists: typedLearningLists,
    pieces: (pieces ?? []) as Piece[],
    userPieces: typedUserPieces,
    userKnownPieces: typedUserKnownPieces,
    dueToday,
    backlogSummary,
    needsAttentionCount,
    recentFriendActivity,
    streakSummary,
    gettingStartedState,
  }
}