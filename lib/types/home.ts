import type { BadgeCategory } from "./badges"

export type GettingStartedTaskId =
  | "complete_profile"
  | "add_tunes"
  | "mark_known"
  | "start_practice"
  | "create_list"
  | "complete_first_review"
  | "finish_today"

export type GettingStartedTaskGroup =
  | "Set up your account"
  | "Build repertoire state"
  | "Learn the practice loop"

export type GettingStartedTask = {
  id: GettingStartedTaskId
  group: GettingStartedTaskGroup
  label: string
  description: string
  href: string
  actionLabel: string
  pendingLabel: string
  isComplete: boolean
}

export type GettingStartedState = {
  shouldShow: boolean
  completedCount: number
  totalCount: number
  nextTask: GettingStartedTask | null
  tasks: GettingStartedTask[]
}

export type HomeTunePreview = {
  user_piece_id: number
  piece_id: number
  title: string
  stage: number
}

export type HomeListPreview = {
  id: number
  name: string
}

export type HomeLearningQueuePreview = {
  piece_id: number
  title: string
  firstAddedAt: string | null
  firstListId: number
  firstListName: string
  listNames: string[]
}

export type HomeBadgePreview = {
  id: number
  name: string
  slug: string
  category: BadgeCategory
  created_at?: string | null
  awarded_at?: string | null
}

export type HomeBadgeSummary = {
  receivedCount: number
  createdCount: number
  recentReceivedBadges: HomeBadgePreview[]
  recentCreatedBadges: HomeBadgePreview[]
}

export type HomeSummaryData = {
  knownCount: number
  practiceCount: number
  dueTodayCount: number
  needsAttentionCount: number
  listCount: number
  learningQueueCount: number
  badgeSummary: HomeBadgeSummary
  dueTodayPreview: HomeTunePreview[]
  learningQueuePreview: HomeLearningQueuePreview[]
  inPracticePreview: HomeTunePreview[]
  listPreview: HomeListPreview[]
}