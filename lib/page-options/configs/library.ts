import type { PageOptionsConfig } from "@/lib/page-options/types"
import { preferences, visibleSections } from "./shared"

const LIBRARY_SECTIONS = [
  {
    id: "header_actions",
    label: "Header actions",
    description: "Create tune, bulk import, and other catalogue actions.",
  },
  {
    id: "status_messages",
    label: "Status messages",
    description: "Feedback after creating, importing, deleting, or updating tunes.",
  },
  {
    id: "filters",
    label: "Filters",
    description: "Search, key, style, and time signature controls.",
  },
  {
    id: "results_header_top",
    label: "Top results header",
    description: "Result count and pagination summary above the tune list.",
  },
  {
    id: "tune_results",
    label: "Tune results",
    description: "The catalogue tune cards.",
    isCore: true,
  },
  {
    id: "results_header_bottom",
    label: "Bottom results header",
    description: "Repeated result count and pagination controls below the tune list.",
  },
] as const

const libraryAllVisible = visibleSections({
  header_actions: true,
  status_messages: true,
  filters: true,
  results_header_top: true,
  tune_results: true,
  results_header_bottom: true,
})

export const LIBRARY_PAGE_OPTIONS_CONFIG: PageOptionsConfig = {
  pageKey: "library",
  title: "Tunes Page Options",
  description: "Choose how the tune catalogue page is arranged.",
  helperText:
    "These settings affect only the catalogue page layout. They do not change canonical tune data or your practice state.",
  sections: [...LIBRARY_SECTIONS],
  allowColumns: false,
  allowDensity: true,
  defaultPreferences: preferences({
    layoutPreset: "catalogue",
    visibleSections: libraryAllVisible,
  }),
  presets: [
    {
      id: "catalogue",
      label: "Catalogue",
      description: "Shows actions, filters, result summaries, and tune results.",
      preferences: preferences({
        layoutPreset: "catalogue",
        visibleSections: libraryAllVisible,
      }),
    },
    {
      id: "management",
      label: "Management",
      description: "Prioritises actions, feedback, and full result controls.",
      preferences: preferences({
        layoutPreset: "management",
        visibleSections: libraryAllVisible,
      }),
    },
    {
      id: "minimal",
      label: "Minimal",
      description: "Shows filters and tune results with less surrounding chrome.",
      preferences: preferences({
        layoutPreset: "minimal",
        density: "compact",
        visibleSections: visibleSections({
          header_actions: false,
          status_messages: true,
          filters: true,
          results_header_top: false,
          tune_results: true,
          results_header_bottom: true,
        }),
      }),
    },
  ],
}