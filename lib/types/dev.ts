export type AppAdminRole = "owner" | "admin"

export type BetaFeedbackCategory =
  | "broken"
  | "confusing"
  | "design"
  | "feature_request"
  | "other"

export type BetaFeedbackSeverity = "low" | "medium" | "high"

export type BetaFeedbackOwnerPriority =
  | "low"
  | "medium"
  | "high"
  | "launch_blocker"

export type BetaFeedbackStatus =
  | "new"
  | "triaged"
  | "planned"
  | "fixed"
  | "wont_fix"
  | "needs_more_info"

export type BetaFeedbackItem = {
  id: number
  user_id: string
  category: BetaFeedbackCategory
  severity: BetaFeedbackSeverity
  owner_priority: BetaFeedbackOwnerPriority
  status: BetaFeedbackStatus
  page_path: string
  page_url: string | null
  message: string
  browser: string | null
  viewport_width: number | null
  viewport_height: number | null
  owner_notes: string | null
  created_at: string
  updated_at: string
  resolved_at: string | null
  userEmail: string | null
  userDisplayName: string | null
  username: string | null
}

export type DevSummaryData = {
  totalUsers: number
  activeUsersThisWeek: number
  totalFeedback: number
  openFeedback: number
  launchBlockers: number
  reviewsThisWeek: number
  mostReportedPage: string | null
}

export type DevFeatureUsageRow = {
  eventType: string
  count: number
  uniqueUsers: number
  lastSeen: string | null
}

export type DevUserActivityRow = {
  userId: string
  email: string | null
  username: string | null
  displayName: string | null
  joinedAt: string | null
  lastActiveAt: string | null
  knownTuneCount: number
  practiceTuneCount: number
  listCount: number
  reviewCount: number
  feedbackCount: number
}

export type DevMetricVisualisationRow = {
  id: string
  label: string
  value: number
  secondaryValue?: number | null
  secondaryLabel?: string | null
  helper?: string | null
}

export type DevMetricVisualisation = {
  id: string
  label: string
  description: string
  primaryLabel: string
  secondaryLabel?: string | null
  rows: DevMetricVisualisationRow[]
}

export type DevDashboardData = {
  feedbackItems: BetaFeedbackItem[]
  summary: DevSummaryData
  featureUsage: DevFeatureUsageRow[]
  userActivity: DevUserActivityRow[]
  metricVisualisations: DevMetricVisualisation[]
}