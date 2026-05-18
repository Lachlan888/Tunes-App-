import { requireAppAdmin } from "@/lib/auth/roles"
import type {
  BetaFeedbackCategory,
  BetaFeedbackItem,
  BetaFeedbackOwnerPriority,
  BetaFeedbackSeverity,
  BetaFeedbackStatus,
  DevDashboardData,
  DevFeatureUsageRow,
  DevMetricVisualisation,
  DevMetricVisualisationRow,
  DevSummaryData,
  DevUserActivityRow,
} from "@/lib/types/dev"

type SupabaseAdminClient = Awaited<
  ReturnType<typeof requireAppAdmin>
>["supabase"]

type AnyRow = Record<string, unknown>

type ProfileRow = {
  id: string
  username: string | null
  display_name: string | null
  created_at?: string | null
}

type FeedbackRow = {
  id: number | string
  user_id: string
  category: string | null
  severity: string | null
  owner_priority: string | null
  status: string | null
  page_path: string | null
  page_url: string | null
  message: string | null
  browser: string | null
  viewport_width: number | null
  viewport_height: number | null
  owner_notes: string | null
  created_at: string | null
  updated_at: string | null
  resolved_at: string | null
}

type EventRow = {
  user_id: string | null
  event_type: string
  page_path?: string | null
  entity_type?: string | null
  entity_id?: string | null
  created_at: string | null
}

function weekAgoIso() {
  const date = new Date()
  date.setDate(date.getDate() - 7)
  return date.toISOString()
}

function safeString(value: unknown) {
  return typeof value === "string" ? value : null
}

function safeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0
}

function getStringFromKeys(row: AnyRow, keys: string[]) {
  for (const key of keys) {
    const value = row[key]

    if (typeof value === "string" && value.length > 0) {
      return value
    }
  }

  return null
}

function getNumberFromKeys(row: AnyRow, keys: string[]) {
  for (const key of keys) {
    const value = row[key]

    if (typeof value === "number" && Number.isFinite(value)) {
      return value
    }

    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value)

      if (Number.isFinite(parsed)) {
        return parsed
      }
    }
  }

  return null
}

function formatEventType(value: string) {
  return value.replaceAll("_", " ")
}

function formatFeedbackCategory(value: string) {
  return value.replaceAll("_", " ")
}

function formatUserLabel(row: DevUserActivityRow) {
  return row.displayName || row.username || row.email || row.userId
}

function incrementMap(map: Map<string, number>, key: string, amount = 1) {
  map.set(key, (map.get(key) ?? 0) + amount)
}

async function safeSelectRows<T extends AnyRow>(
  supabase: SupabaseAdminClient,
  table: string,
  limit = 5000
): Promise<T[]> {
  const { data, error } = await supabase.from(table).select("*").limit(limit)

  if (error) {
    console.error(`Error loading dev table "${table}":`, {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    })

    return []
  }

  return (data ?? []) as T[]
}

async function safeCountTable(
  supabase: SupabaseAdminClient,
  table: string
): Promise<number> {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })

  if (error) {
    console.error(`Error counting dev table "${table}":`, {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    })

    return 0
  }

  return count ?? 0
}

async function loadProfiles(
  supabase: SupabaseAdminClient
): Promise<ProfileRow[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as ProfileRow[]
}

async function loadFeedback(
  supabase: SupabaseAdminClient
): Promise<FeedbackRow[]> {
  const { data, error } = await supabase
    .from("beta_feedback")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200)

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as FeedbackRow[]
}

async function loadEventRows(
  supabase: SupabaseAdminClient,
  table: "app_events" | "user_activity_events"
): Promise<EventRow[]> {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(2000)

  if (error) {
    console.error(`Error loading ${table}:`, {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    })

    return []
  }

  return ((data ?? []) as AnyRow[])
    .map((row) => ({
      user_id: safeString(row.user_id),
      event_type: safeString(row.event_type) ?? "unknown_event",
      page_path: safeString(row.page_path),
      entity_type: safeString(row.entity_type),
      entity_id: safeString(row.entity_id),
      created_at: safeString(row.created_at),
    }))
    .filter((row) => row.event_type !== "unknown_event")
}

function normaliseFeedbackRow(
  row: FeedbackRow,
  profileById: Map<string, ProfileRow>
): BetaFeedbackItem {
  const profile = profileById.get(row.user_id) ?? null

  return {
    id: Number(row.id),
    user_id: row.user_id,
    category: (row.category ?? "other") as BetaFeedbackCategory,
    severity: (row.severity ?? "medium") as BetaFeedbackSeverity,
    owner_priority: (row.owner_priority ??
      "medium") as BetaFeedbackOwnerPriority,
    status: (row.status ?? "new") as BetaFeedbackStatus,
    page_path: row.page_path ?? "unknown",
    page_url: row.page_url,
    message: row.message ?? "",
    browser: row.browser,
    viewport_width: row.viewport_width,
    viewport_height: row.viewport_height,
    owner_notes: row.owner_notes,
    created_at: row.created_at ?? "",
    updated_at: row.updated_at ?? row.created_at ?? "",
    resolved_at: row.resolved_at,
    userEmail: null,
    userDisplayName: profile?.display_name ?? null,
    username: profile?.username ?? null,
  }
}

function summariseFeatureUsage(events: EventRow[]): DevFeatureUsageRow[] {
  const map = new Map<
    string,
    {
      eventType: string
      count: number
      users: Set<string>
      lastSeen: string | null
    }
  >()

  for (const event of events) {
    const existing =
      map.get(event.event_type) ??
      {
        eventType: event.event_type,
        count: 0,
        users: new Set<string>(),
        lastSeen: null,
      }

    existing.count += 1

    if (event.user_id) {
      existing.users.add(event.user_id)
    }

    if (
      event.created_at &&
      (!existing.lastSeen || event.created_at > existing.lastSeen)
    ) {
      existing.lastSeen = event.created_at
    }

    map.set(event.event_type, existing)
  }

  return Array.from(map.values())
    .map((item) => ({
      eventType: item.eventType,
      count: item.count,
      uniqueUsers: item.users.size,
      lastSeen: item.lastSeen,
    }))
    .sort((a, b) => b.count - a.count)
}

function mostReportedPage(feedbackItems: BetaFeedbackItem[]) {
  const counts = new Map<string, number>()

  for (const item of feedbackItems) {
    counts.set(item.page_path, (counts.get(item.page_path) ?? 0) + 1)
  }

  let bestPage: string | null = null
  let bestCount = 0

  for (const [page, count] of counts.entries()) {
    if (count > bestCount) {
      bestPage = page
      bestCount = count
    }
  }

  return bestPage
}

function getEventFamily(eventType: string) {
  if (
    eventType.includes("review") ||
    eventType.includes("practice") ||
    eventType.includes("known")
  ) {
    return "Practice"
  }

  if (eventType.includes("list") && !eventType.includes("setlist")) {
    return "Lists"
  }

  if (eventType.includes("setlist")) {
    return "Setlists"
  }

  if (
    eventType.includes("friend") ||
    eventType.includes("connection") ||
    eventType.includes("compare")
  ) {
    return "Social"
  }

  if (eventType.includes("focus") || eventType.includes("foci")) {
    return "Foci"
  }

  if (eventType.includes("badge")) {
    return "Badges"
  }

  if (
    eventType.includes("lore") ||
    eventType.includes("media") ||
    eventType.includes("sheet") ||
    eventType.includes("comment") ||
    eventType.includes("detail")
  ) {
    return "Tune enrichment"
  }

  if (eventType.includes("feedback")) {
    return "Feedback"
  }

  if (eventType.includes("tune") || eventType.includes("piece")) {
    return "Tunes"
  }

  return "Other"
}

function buildFeatureFamilyVisualisation(
  events: EventRow[]
): DevMetricVisualisation {
  const familyMap = new Map<
    string,
    {
      count: number
      users: Set<string>
      lastSeen: string | null
    }
  >()

  for (const event of events) {
    const family = getEventFamily(event.event_type)
    const existing =
      familyMap.get(family) ??
      {
        count: 0,
        users: new Set<string>(),
        lastSeen: null,
      }

    existing.count += 1

    if (event.user_id) {
      existing.users.add(event.user_id)
    }

    if (
      event.created_at &&
      (!existing.lastSeen || event.created_at > existing.lastSeen)
    ) {
      existing.lastSeen = event.created_at
    }

    familyMap.set(family, existing)
  }

  return {
    id: "feature_families",
    label: "Feature families",
    description:
      "A whole-app view of which product areas are getting used across beta activity events.",
    primaryLabel: "Events",
    secondaryLabel: "Users",
    rows: Array.from(familyMap.entries())
      .map(([family, data]) => ({
        id: family,
        label: family,
        value: data.count,
        secondaryValue: data.users.size,
        secondaryLabel: "users",
        helper: data.lastSeen ? `Last seen ${data.lastSeen}` : null,
      }))
      .sort((a, b) => b.value - a.value),
  }
}

function buildFeatureUsageVisualisation(
  featureUsage: DevFeatureUsageRow[]
): DevMetricVisualisation {
  return {
    id: "feature_usage",
    label: "Individual actions",
    description:
      "The most common recorded actions across app_events and user_activity_events.",
    primaryLabel: "Events",
    secondaryLabel: "Users",
    rows: featureUsage.map((row) => ({
      id: row.eventType,
      label: formatEventType(row.eventType),
      value: row.count,
      secondaryValue: row.uniqueUsers,
      secondaryLabel: "users",
      helper: row.lastSeen ? `Last seen ${row.lastSeen}` : null,
    })),
  }
}

function buildStateVisualisation(
  stateCounts: Record<string, number>
): DevMetricVisualisation {
  return {
    id: "app_state",
    label: "Current app state",
    description:
      "What currently exists in the database, independent of whether the action was event-tracked.",
    primaryLabel: "Rows",
    rows: [
      {
        id: "pieces",
        label: "Canonical tunes",
        value: stateCounts.pieces,
        helper: "pieces",
      },
      {
        id: "practice",
        label: "Tunes in practice",
        value: stateCounts.userPieces,
        helper: "user_pieces",
      },
      {
        id: "known",
        label: "Known tune records",
        value: stateCounts.knownPieces,
        helper: "user_known_pieces",
      },
      {
        id: "lists",
        label: "Lists",
        value: stateCounts.learningLists,
        helper: "learning_lists",
      },
      {
        id: "list_items",
        label: "List memberships",
        value: stateCounts.learningListItems,
        helper: "learning_list_items",
      },
      {
        id: "setlists",
        label: "Setlists",
        value: stateCounts.setlists,
        helper: "setlists",
      },
      {
        id: "setlist_items",
        label: "Setlist items",
        value: stateCounts.setlistItems,
        helper: "setlist_items",
      },
      {
        id: "connections",
        label: "Connections",
        value: stateCounts.connections,
        helper: "connections",
      },
      {
        id: "foci",
        label: "Practice foci",
        value: stateCounts.practiceFoci,
        helper: "practice_foci",
      },
      {
        id: "focus_tunes",
        label: "Focus tune links",
        value: stateCounts.practiceFocusTunes,
        helper: "practice_focus_tunes",
      },
      {
        id: "badges",
        label: "Badges",
        value: stateCounts.badges,
        helper: "badges",
      },
      {
        id: "badge_awards",
        label: "Badge awards",
        value: stateCounts.badgeAwards,
        helper: "badge_awards",
      },
      {
        id: "feedback",
        label: "Feedback reports",
        value: stateCounts.feedback,
        helper: "beta_feedback",
      },
    ].sort((a, b) => b.value - a.value),
  }
}

function buildFeedbackByPageVisualisation(
  feedbackItems: BetaFeedbackItem[]
): DevMetricVisualisation {
  const pageMap = new Map<
    string,
    {
      count: number
      openCount: number
      launchBlockerCount: number
    }
  >()

  for (const item of feedbackItems) {
    const existing =
      pageMap.get(item.page_path) ??
      {
        count: 0,
        openCount: 0,
        launchBlockerCount: 0,
      }

    existing.count += 1

    if (item.status !== "fixed" && item.status !== "wont_fix") {
      existing.openCount += 1
    }

    if (item.owner_priority === "launch_blocker") {
      existing.launchBlockerCount += 1
    }

    pageMap.set(item.page_path, existing)
  }

  return {
    id: "feedback_by_page",
    label: "Feedback by page",
    description:
      "Which pages are generating the most beta feedback and unresolved friction.",
    primaryLabel: "Reports",
    secondaryLabel: "Open",
    rows: Array.from(pageMap.entries())
      .map(([pagePath, data]) => ({
        id: pagePath,
        label: pagePath,
        value: data.count,
        secondaryValue: data.openCount,
        secondaryLabel: "open",
        helper:
          data.launchBlockerCount > 0
            ? `${data.launchBlockerCount} launch blocker`
            : null,
      }))
      .sort((a, b) => b.value - a.value),
  }
}

function buildFeedbackByCategoryVisualisation(
  feedbackItems: BetaFeedbackItem[]
): DevMetricVisualisation {
  const categoryMap = new Map<
    string,
    {
      count: number
      openCount: number
    }
  >()

  for (const item of feedbackItems) {
    const existing =
      categoryMap.get(item.category) ??
      {
        count: 0,
        openCount: 0,
      }

    existing.count += 1

    if (item.status !== "fixed" && item.status !== "wont_fix") {
      existing.openCount += 1
    }

    categoryMap.set(item.category, existing)
  }

  return {
    id: "feedback_by_category",
    label: "Feedback by category",
    description:
      "Whether testers are reporting broken things, confusion, design issues, or feature requests.",
    primaryLabel: "Reports",
    secondaryLabel: "Open",
    rows: Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        id: category,
        label: formatFeedbackCategory(category),
        value: data.count,
        secondaryValue: data.openCount,
        secondaryLabel: "open",
      }))
      .sort((a, b) => b.value - a.value),
  }
}

function buildUserMetricVisualisation({
  id,
  label,
  description,
  primaryLabel,
  rows,
  getValue,
}: {
  id: string
  label: string
  description: string
  primaryLabel: string
  rows: DevUserActivityRow[]
  getValue: (row: DevUserActivityRow) => number
}): DevMetricVisualisation {
  return {
    id,
    label,
    description,
    primaryLabel,
    secondaryLabel: "Last active",
    rows: rows
      .map((row) => ({
        id: row.userId,
        label: formatUserLabel(row),
        value: getValue(row),
        helper: row.lastActiveAt
          ? `Last active ${row.lastActiveAt}`
          : "No recorded activity",
      }))
      .filter((row) => row.value > 0)
      .sort((a, b) => b.value - a.value),
  }
}

function buildGenericUserVisualisation({
  id,
  label,
  description,
  primaryLabel,
  countByUser,
  userActivity,
}: {
  id: string
  label: string
  description: string
  primaryLabel: string
  countByUser: Map<string, number>
  userActivity: DevUserActivityRow[]
}): DevMetricVisualisation {
  const userById = new Map(userActivity.map((row) => [row.userId, row]))

  return {
    id,
    label,
    description,
    primaryLabel,
    secondaryLabel: "Last active",
    rows: Array.from(countByUser.entries())
      .map(([userId, value]) => {
        const user = userById.get(userId)

        return {
          id: userId,
          label: user ? formatUserLabel(user) : userId,
          value,
          helper: user?.lastActiveAt
            ? `Last active ${user.lastActiveAt}`
            : "No recorded activity",
        }
      })
      .filter((row) => row.value > 0)
      .sort((a, b) => b.value - a.value),
  }
}

function buildTuneEnrichmentVisualisation({
  loreCount,
  mediaCount,
  sheetMusicCount,
  commentCount,
  tuneDetailEvents,
}: {
  loreCount: number
  mediaCount: number
  sheetMusicCount: number
  commentCount: number
  tuneDetailEvents: number
}): DevMetricVisualisation {
  return {
    id: "tune_enrichment",
    label: "Tune enrichment",
    description:
      "How much users are improving the catalogue with comments, lore, media, sheet music, and detail additions.",
    primaryLabel: "Items",
    rows: [
      {
        id: "lore",
        label: "Lore entries",
        value: loreCount,
        helper: "piece lore table rows, if present",
      },
      {
        id: "media",
        label: "Media links",
        value: mediaCount,
        helper: "piece media link table rows, if present",
      },
      {
        id: "sheet_music",
        label: "Sheet music links",
        value: sheetMusicCount,
        helper: "piece sheet music table rows, if present",
      },
      {
        id: "comments",
        label: "Comments",
        value: commentCount,
        helper: "comment table rows, if present",
      },
      {
        id: "detail_events",
        label: "Detail/lore/media events",
        value: tuneDetailEvents,
        helper: "recorded event stream",
      },
    ].sort((a, b) => b.value - a.value),
  }
}

function buildEventsByPageVisualisation(events: EventRow[]): DevMetricVisualisation {
  const pageMap = new Map<
    string,
    {
      count: number
      users: Set<string>
    }
  >()

  for (const event of events) {
    const pagePath = event.page_path || "unknown"
    const existing =
      pageMap.get(pagePath) ??
      {
        count: 0,
        users: new Set<string>(),
      }

    existing.count += 1

    if (event.user_id) {
      existing.users.add(event.user_id)
    }

    pageMap.set(pagePath, existing)
  }

  return {
    id: "events_by_page",
    label: "Activity by page",
    description:
      "Which pages are producing the most recorded product activity events.",
    primaryLabel: "Events",
    secondaryLabel: "Users",
    rows: Array.from(pageMap.entries())
      .map(([pagePath, data]) => ({
        id: pagePath,
        label: pagePath,
        value: data.count,
        secondaryValue: data.users.size,
        secondaryLabel: "users",
      }))
      .sort((a, b) => b.value - a.value),
  }
}

function countRowsByUser(
  rows: AnyRow[],
  userKeys = ["user_id", "owner_user_id", "created_by_user_id", "recipient_user_id"]
) {
  const map = new Map<string, number>()

  for (const row of rows) {
    const userId = getStringFromKeys(row, userKeys)

    if (userId) {
      incrementMap(map, userId)
    }
  }

  return map
}

function buildUserActivityRows({
  profiles,
  feedbackItems,
  allEvents,
  knownRows,
  practiceRows,
  listRows,
  reviewRows,
}: {
  profiles: ProfileRow[]
  feedbackItems: BetaFeedbackItem[]
  allEvents: EventRow[]
  knownRows: AnyRow[]
  practiceRows: AnyRow[]
  listRows: AnyRow[]
  reviewRows: AnyRow[]
}): DevUserActivityRow[] {
  const knownCountByUser = countRowsByUser(knownRows)
  const practiceCountByUser = countRowsByUser(practiceRows)
  const listCountByUser = countRowsByUser(listRows)
  const feedbackCountByUser = new Map<string, number>()
  const reviewCountByUser = new Map<string, number>()
  const lastActiveByUser = new Map<string, string>()

  for (const item of feedbackItems) {
    incrementMap(feedbackCountByUser, item.user_id)
  }

  for (const event of allEvents) {
    if (event.user_id && event.created_at) {
      const existing = lastActiveByUser.get(event.user_id)

      if (!existing || event.created_at > existing) {
        lastActiveByUser.set(event.user_id, event.created_at)
      }
    }

    if (event.user_id && event.event_type === "tune_reviewed") {
      incrementMap(reviewCountByUser, event.user_id)
    }
  }

  for (const row of reviewRows) {
    const userId = getStringFromKeys(row, ["user_id", "reviewer_user_id"])

    if (userId) {
      incrementMap(reviewCountByUser, userId)
    }
  }

  return profiles
    .map((profile) => ({
      userId: profile.id,
      email: null,
      username: profile.username,
      displayName: profile.display_name,
      joinedAt: profile.created_at ?? null,
      lastActiveAt: lastActiveByUser.get(profile.id) ?? null,
      knownTuneCount: knownCountByUser.get(profile.id) ?? 0,
      practiceTuneCount: practiceCountByUser.get(profile.id) ?? 0,
      listCount: listCountByUser.get(profile.id) ?? 0,
      reviewCount: reviewCountByUser.get(profile.id) ?? 0,
      feedbackCount: feedbackCountByUser.get(profile.id) ?? 0,
    }))
    .sort((a, b) => {
      const aDate = a.lastActiveAt ?? a.joinedAt ?? ""
      const bDate = b.lastActiveAt ?? b.joinedAt ?? ""
      return bDate.localeCompare(aDate)
    })
}

function buildListItemCountsByUser(
  listRows: AnyRow[],
  listItemRows: AnyRow[]
) {
  const listOwnerById = new Map<number, string>()

  for (const row of listRows) {
    const listId = getNumberFromKeys(row, ["id"])
    const userId = getStringFromKeys(row, ["user_id", "owner_user_id"])

    if (listId !== null && userId) {
      listOwnerById.set(listId, userId)
    }
  }

  const countByUser = new Map<string, number>()

  for (const row of listItemRows) {
    const listId = getNumberFromKeys(row, ["learning_list_id", "list_id"])

    if (listId === null) continue

    const userId = listOwnerById.get(listId)

    if (userId) {
      incrementMap(countByUser, userId)
    }
  }

  return countByUser
}

function buildSetlistItemCountsByUser(
  setlistRows: AnyRow[],
  setlistItemRows: AnyRow[]
) {
  const ownerBySetlistId = new Map<number, string>()

  for (const row of setlistRows) {
    const setlistId = getNumberFromKeys(row, ["id"])
    const userId = getStringFromKeys(row, [
      "user_id",
      "owner_user_id",
      "created_by_user_id",
    ])

    if (setlistId !== null && userId) {
      ownerBySetlistId.set(setlistId, userId)
    }
  }

  const countByUser = new Map<string, number>()

  for (const row of setlistItemRows) {
    const setlistId = getNumberFromKeys(row, ["setlist_id"])

    if (setlistId === null) continue

    const userId = ownerBySetlistId.get(setlistId)

    if (userId) {
      incrementMap(countByUser, userId)
    }
  }

  return countByUser
}

function buildMetricVisualisations({
  featureUsage,
  feedbackItems,
  userActivity,
  allEvents,
  stateCounts,
  listItemCountByUser,
  setlistCountByUser,
  setlistItemCountByUser,
  focusCountByUser,
  badgeCountByUser,
  badgeAwardCountByUser,
  tuneEnrichmentCounts,
}: {
  featureUsage: DevFeatureUsageRow[]
  feedbackItems: BetaFeedbackItem[]
  userActivity: DevUserActivityRow[]
  allEvents: EventRow[]
  stateCounts: Record<string, number>
  listItemCountByUser: Map<string, number>
  setlistCountByUser: Map<string, number>
  setlistItemCountByUser: Map<string, number>
  focusCountByUser: Map<string, number>
  badgeCountByUser: Map<string, number>
  badgeAwardCountByUser: Map<string, number>
  tuneEnrichmentCounts: {
    loreCount: number
    mediaCount: number
    sheetMusicCount: number
    commentCount: number
    tuneDetailEvents: number
  }
}): DevMetricVisualisation[] {
  return [
    buildFeatureFamilyVisualisation(allEvents),
    buildFeatureUsageVisualisation(featureUsage),
    buildEventsByPageVisualisation(allEvents),
    buildStateVisualisation(stateCounts),
    buildFeedbackByPageVisualisation(feedbackItems),
    buildFeedbackByCategoryVisualisation(feedbackItems),
    buildTuneEnrichmentVisualisation(tuneEnrichmentCounts),
    buildUserMetricVisualisation({
      id: "reviews_by_user",
      label: "Reviews by user",
      description:
        "Which users have completed the most recorded review activity.",
      primaryLabel: "Reviews",
      rows: userActivity,
      getValue: (row) => row.reviewCount,
    }),
    buildUserMetricVisualisation({
      id: "known_tunes_by_user",
      label: "Known tunes by user",
      description: "Which users have marked the most tunes as known.",
      primaryLabel: "Known tunes",
      rows: userActivity,
      getValue: (row) => row.knownTuneCount,
    }),
    buildUserMetricVisualisation({
      id: "practice_tunes_by_user",
      label: "Practice tunes by user",
      description: "Which users currently have the most tunes in practice.",
      primaryLabel: "Practice tunes",
      rows: userActivity,
      getValue: (row) => row.practiceTuneCount,
    }),
    buildUserMetricVisualisation({
      id: "lists_by_user",
      label: "Lists by user",
      description: "Which users have created the most tune lists.",
      primaryLabel: "Lists",
      rows: userActivity,
      getValue: (row) => row.listCount,
    }),
    buildGenericUserVisualisation({
      id: "list_items_by_user",
      label: "List memberships by user",
      description:
        "Which users have the most tune-to-list memberships across their owned lists.",
      primaryLabel: "List items",
      countByUser: listItemCountByUser,
      userActivity,
    }),
    buildGenericUserVisualisation({
      id: "setlists_by_user",
      label: "Setlists by user",
      description:
        "Which users have created or own the most setlists, where the table is present.",
      primaryLabel: "Setlists",
      countByUser: setlistCountByUser,
      userActivity,
    }),
    buildGenericUserVisualisation({
      id: "setlist_items_by_user",
      label: "Setlist items by user",
      description:
        "Which users have the most tune entries inside owned setlists, where the table is present.",
      primaryLabel: "Setlist items",
      countByUser: setlistItemCountByUser,
      userActivity,
    }),
    buildGenericUserVisualisation({
      id: "foci_by_user",
      label: "Foci by user",
      description:
        "Which users have created the most practice foci, where the table is present.",
      primaryLabel: "Foci",
      countByUser: focusCountByUser,
      userActivity,
    }),
    buildGenericUserVisualisation({
      id: "badges_by_user",
      label: "Badges by user",
      description:
        "Which users have created the most badges, where the table is present.",
      primaryLabel: "Badges",
      countByUser: badgeCountByUser,
      userActivity,
    }),
    buildGenericUserVisualisation({
      id: "badge_awards_by_user",
      label: "Badge awards by recipient",
      description:
        "Which users have received the most badge awards, where the table is present.",
      primaryLabel: "Awards",
      countByUser: badgeAwardCountByUser,
      userActivity,
    }),
    buildUserMetricVisualisation({
      id: "feedback_by_user",
      label: "Feedback by user",
      description: "Which users have submitted the most beta feedback.",
      primaryLabel: "Reports",
      rows: userActivity,
      getValue: (row) => row.feedbackCount,
    }),
  ]
}

export async function loadDevDashboardData(): Promise<DevDashboardData> {
  const { supabase } = await requireAppAdmin()
  const since = weekAgoIso()

  const [
    profiles,
    feedbackRows,
    appEvents,
    activityEvents,
    knownRows,
    practiceRows,
    listRows,
    listItemRows,
    reviewRows,
    setlistRows,
    setlistItemRows,
    connectionRows,
    focusRows,
    focusTuneRows,
    badgeRows,
    badgeAwardRows,
    loreCount,
    mediaCount,
    sheetMusicCount,
    commentCount,
    piecesCount,
  ] = await Promise.all([
    loadProfiles(supabase),
    loadFeedback(supabase),
    loadEventRows(supabase, "app_events"),
    loadEventRows(supabase, "user_activity_events"),
    safeSelectRows<AnyRow>(supabase, "user_known_pieces"),
    safeSelectRows<AnyRow>(supabase, "user_pieces"),
    safeSelectRows<AnyRow>(supabase, "learning_lists"),
    safeSelectRows<AnyRow>(supabase, "learning_list_items"),
    safeSelectRows<AnyRow>(supabase, "review_events"),
    safeSelectRows<AnyRow>(supabase, "setlists"),
    safeSelectRows<AnyRow>(supabase, "setlist_items"),
    safeSelectRows<AnyRow>(supabase, "connections"),
    safeSelectRows<AnyRow>(supabase, "practice_foci"),
    safeSelectRows<AnyRow>(supabase, "practice_focus_tunes"),
    safeSelectRows<AnyRow>(supabase, "badges"),
    safeSelectRows<AnyRow>(supabase, "badge_awards"),
    safeCountTable(supabase, "piece_lore_entries"),
    safeCountTable(supabase, "piece_media_links"),
    safeCountTable(supabase, "piece_sheet_music_links"),
    safeCountTable(supabase, "comments"),
    safeCountTable(supabase, "pieces"),
  ])

  const profileById = new Map(profiles.map((profile) => [profile.id, profile]))

  const feedbackItems = feedbackRows.map((row) =>
    normaliseFeedbackRow(row, profileById)
  )

  const allEvents = [...appEvents, ...activityEvents]
  const featureUsage = summariseFeatureUsage(allEvents)

  const uniqueActiveUsersThisWeek = new Set(
    allEvents
      .filter((event) => event.user_id && event.created_at && event.created_at >= since)
      .map((event) => event.user_id as string)
  )

  const reviewsThisWeek = allEvents.filter(
    (event) =>
      event.created_at &&
      event.created_at >= since &&
      (event.event_type === "tune_reviewed" ||
        event.event_type === "formal_review")
  ).length

  const userActivity = buildUserActivityRows({
    profiles,
    feedbackItems,
    allEvents,
    knownRows,
    practiceRows,
    listRows,
    reviewRows,
  })

  const setlistCountByUser = countRowsByUser(setlistRows, [
    "user_id",
    "owner_user_id",
    "created_by_user_id",
  ])

  const focusCountByUser = countRowsByUser(focusRows, [
    "user_id",
    "owner_user_id",
  ])

  const badgeCountByUser = countRowsByUser(badgeRows, [
    "user_id",
    "owner_user_id",
    "created_by_user_id",
  ])

  const badgeAwardCountByUser = countRowsByUser(badgeAwardRows, [
    "recipient_user_id",
    "user_id",
  ])

  const listItemCountByUser = buildListItemCountsByUser(listRows, listItemRows)
  const setlistItemCountByUser = buildSetlistItemCountsByUser(
    setlistRows,
    setlistItemRows
  )

  const tuneDetailEvents = allEvents.filter((event) =>
    [
      "piece_details_added",
      "piece_lore_added",
      "piece_media_link_added",
      "piece_sheet_music_link_added",
      "comment_added",
      "created_tune",
      "updated_missing_tune_details",
    ].includes(event.event_type)
  ).length

  const stateCounts = {
    pieces: piecesCount,
    userPieces: practiceRows.length,
    knownPieces: knownRows.length,
    learningLists: listRows.length,
    learningListItems: listItemRows.length,
    setlists: setlistRows.length,
    setlistItems: setlistItemRows.length,
    connections: connectionRows.length,
    practiceFoci: focusRows.length,
    practiceFocusTunes: focusTuneRows.length,
    badges: badgeRows.length,
    badgeAwards: badgeAwardRows.length,
    feedback: feedbackItems.length,
  }

  const summary: DevSummaryData = {
    totalUsers: profiles.length,
    activeUsersThisWeek: uniqueActiveUsersThisWeek.size,
    totalFeedback: feedbackItems.length,
    openFeedback: feedbackItems.filter(
      (item) => item.status !== "fixed" && item.status !== "wont_fix"
    ).length,
    launchBlockers: feedbackItems.filter(
      (item) => item.owner_priority === "launch_blocker"
    ).length,
    reviewsThisWeek,
    mostReportedPage: mostReportedPage(feedbackItems),
  }

  const metricVisualisations = buildMetricVisualisations({
    featureUsage,
    feedbackItems,
    userActivity,
    allEvents,
    stateCounts,
    listItemCountByUser,
    setlistCountByUser,
    setlistItemCountByUser,
    focusCountByUser,
    badgeCountByUser,
    badgeAwardCountByUser,
    tuneEnrichmentCounts: {
      loreCount,
      mediaCount,
      sheetMusicCount,
      commentCount,
      tuneDetailEvents,
    },
  })

  return {
    feedbackItems,
    summary,
    featureUsage,
    userActivity,
    metricVisualisations,
  }
}