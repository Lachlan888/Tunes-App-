import type { PageOptionsConfig } from "@/lib/page-options/types"
import { preferences, visibleSections } from "./shared"

const MODERATOR_SECTIONS = [
  {
    id: "summary_counts",
    label: "Summary counts",
    description:
      "Counts for pending edit requests, comment reports, and lore reports.",
  },
  {
    id: "tune_edit_requests",
    label: "Tune edit requests",
    description: "Canonical tune edit requests awaiting review.",
  },
  {
    id: "comment_reports",
    label: "Comment reports",
    description: "Reported comments awaiting moderation.",
  },
  {
    id: "lore_reports",
    label: "Lore reports",
    description: "Reported lore entries awaiting moderation.",
  },
] as const

const moderatorAllVisible = visibleSections({
  summary_counts: true,
  tune_edit_requests: true,
  comment_reports: true,
  lore_reports: true,
})

export const MODERATOR_PAGE_OPTIONS_CONFIG: PageOptionsConfig = {
  pageKey: "moderator",
  title: "Moderator display options",
  description: "Choose how the moderator workspace is arranged.",
  helperText:
    "These settings only affect the moderator page layout. They do not approve, dismiss, hide, or delete anything.",
  sections: [...MODERATOR_SECTIONS],
  allowColumns: false,
  allowDensity: true,
  defaultPreferences: preferences({
    layoutPreset: "triage",
    visibleSections: moderatorAllVisible,
  }),
  presets: [
    {
      id: "triage",
      label: "Triage",
      description:
        "Shows summary counts, tune edit requests, comment reports, and lore reports.",
      preferences: preferences({
        layoutPreset: "triage",
        visibleSections: moderatorAllVisible,
      }),
    },
    {
      id: "tune_edits",
      label: "Tune edits",
      description: "Prioritises shared tune edit requests.",
      preferences: preferences({
        layoutPreset: "tune_edits",
        visibleSections: visibleSections({
          summary_counts: true,
          tune_edit_requests: true,
          comment_reports: false,
          lore_reports: false,
        }),
      }),
    },
    {
      id: "reports",
      label: "Reports",
      description: "Prioritises comment and lore reports.",
      preferences: preferences({
        layoutPreset: "reports",
        visibleSections: visibleSections({
          summary_counts: true,
          tune_edit_requests: false,
          comment_reports: true,
          lore_reports: true,
        }),
      }),
    },
    {
      id: "minimal",
      label: "Minimal",
      description: "Shows summary counts and the main review queues.",
      preferences: preferences({
        layoutPreset: "minimal",
        density: "compact",
        visibleSections: moderatorAllVisible,
      }),
    },
  ],
}
