import type { PageOptionsConfig } from "@/lib/page-options/types"
import { preferences, visibleSections } from "./shared"

const PRACTICE_SECTIONS = [
  {
    id: "practice_nav",
    label: "Practice navigation",
    description: "Links between Review, Diary, and future practice sections.",
  },
  {
    id: "streaks",
    label: "Streaks",
    description: "Revision and practice streak cards.",
  },
  {
    id: "status_messages",
    label: "Status messages",
    description: "Feedback after updating practice.",
  },
  {
    id: "catch_up",
    label: "Catch-up",
    description: "Overdue tunes waiting for review.",
    isCore: true,
  },
  {
    id: "due_today",
    label: "Due today",
    description: "Tunes scheduled for review today.",
    isCore: true,
  },
  {
    id: "active_practice",
    label: "Active practice",
    description: "All tunes currently inside the practice system.",
  },
] as const

const practiceAllVisible = visibleSections({
  practice_nav: true,
  streaks: true,
  status_messages: true,
  catch_up: true,
  due_today: true,
  active_practice: true,
})

export const PRACTICE_PAGE_OPTIONS_CONFIG: PageOptionsConfig = {
  pageKey: "practice",
  title: "Practice display options",
  description: "Choose how the Practice page prioritises review work.",
  helperText:
    "Practice options only change the view. Review scheduling, due dates, and stages are unchanged.",
  sections: [...PRACTICE_SECTIONS],
  allowColumns: false,
  allowDensity: true,
  defaultPreferences: preferences({
    layoutPreset: "review",
    visibleSections: practiceAllVisible,
  }),
  presets: [
    {
      id: "review",
      label: "Review",
      description: "Shows the full practice workflow.",
      preferences: preferences({
        layoutPreset: "review",
        visibleSections: practiceAllVisible,
      }),
    },
    {
      id: "practice_first",
      label: "Practice First",
      description: "Prioritises catch-up and due-today work.",
      preferences: preferences({
        layoutPreset: "practice_first",
        visibleSections: visibleSections({
          practice_nav: true,
          streaks: true,
          status_messages: true,
          catch_up: true,
          due_today: true,
          active_practice: false,
        }),
      }),
    },
    {
      id: "minimal",
      label: "Minimal",
      description: "Shows only the core review queues.",
      preferences: preferences({
        layoutPreset: "minimal",
        density: "compact",
        visibleSections: visibleSections({
          practice_nav: true,
          streaks: false,
          status_messages: true,
          catch_up: true,
          due_today: true,
          active_practice: false,
        }),
      }),
    },
  ],
}
