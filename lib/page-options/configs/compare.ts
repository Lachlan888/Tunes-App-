import type { PageOptionsConfig } from "@/lib/page-options/types"
import { preferences, visibleSections } from "./shared"

const COMPARE_SECTIONS = [
  {
    id: "search_panel",
    label: "Search panel",
    description: "The controls for adding users to a compare group.",
    isCore: true,
  },
  {
    id: "current_group",
    label: "Current group",
    description: "The current compare group summary.",
  },
  {
    id: "status_messages",
    label: "Status messages",
    description: "Friend request and compare lookup feedback.",
  },
  {
    id: "suggestions",
    label: "Suggestions",
    description: "Suggested users or compare prompts.",
  },
  {
    id: "candidate_matches",
    label: "Candidate matches",
    description: "User match lists when a search is ambiguous.",
  },
  {
    id: "results_panel",
    label: "Results panel",
    description: "The common tunes result panel.",
    isCore: true,
  },
] as const

const compareAllVisible = visibleSections({
  search_panel: true,
  current_group: true,
  status_messages: true,
  suggestions: true,
  candidate_matches: true,
  results_panel: true,
})

export const COMPARE_PAGE_OPTIONS_CONFIG: PageOptionsConfig = {
  pageKey: "compare",
  title: "Compare Page Options",
  description: "Choose how the Compare page is arranged.",
  helperText:
    "Compare options only change the page view. They do not affect friend status or repertoire overlap.",
  sections: [...COMPARE_SECTIONS],
  allowColumns: true,
  allowDensity: true,
  defaultPreferences: preferences({
    layoutPreset: "social",
    visibleSections: compareAllVisible,
  }),
  presets: [
    {
      id: "social",
      label: "Social",
      description: "Shows search, suggestions, status, and results.",
      preferences: preferences({
        layoutPreset: "social",
        visibleSections: compareAllVisible,
      }),
    },
    {
      id: "working",
      label: "Working",
      description: "Prioritises search and results.",
      preferences: preferences({
        layoutPreset: "working",
        visibleSections: visibleSections({
          search_panel: true,
          current_group: true,
          status_messages: true,
          suggestions: false,
          candidate_matches: true,
          results_panel: true,
        }),
      }),
    },
    {
      id: "minimal",
      label: "Minimal",
      description: "Shows only search and results.",
      preferences: preferences({
        layoutPreset: "minimal",
        columnMode: "comfortable",
        density: "compact",
        visibleSections: visibleSections({
          search_panel: true,
          current_group: false,
          status_messages: true,
          suggestions: false,
          candidate_matches: true,
          results_panel: true,
        }),
      }),
    },
  ],
}