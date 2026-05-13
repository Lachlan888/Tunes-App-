import type { PageOptionsConfig } from "@/lib/page-options/types"
import { preferences, visibleSections } from "./shared"

const LISTS_SECTIONS = [
  {
    id: "create_list",
    label: "Create list",
    description: "The create-list action near the top of the page.",
  },
  {
    id: "status_messages",
    label: "Status messages",
    description: "Feedback after creating, editing, or deleting lists.",
  },
  {
    id: "summary_grid",
    label: "Summary grid",
    description:
      "My Tunes, Learning Queue, and unlisted-tune organisation prompts.",
  },
  {
    id: "filters",
    label: "Filters",
    description: "Search and filter controls for list browsing.",
  },
  {
    id: "results_header",
    label: "Results header",
    description: "Summary of the current filtered list view.",
  },
  {
    id: "list_results",
    label: "List results",
    description: "The list overview cards.",
    isCore: true,
  },
] as const

const listsAllVisible = visibleSections({
  create_list: true,
  status_messages: true,
  summary_grid: true,
  filters: true,
  results_header: true,
  list_results: true,
})

export const LISTS_PAGE_OPTIONS_CONFIG: PageOptionsConfig = {
  pageKey: "lists",
  title: "Lists Page Options",
  description: "Choose how your list-management page is arranged.",
  helperText:
    "These settings affect only how the Lists page is shown. They do not change list contents, queue order, practice state, or list visibility.",
  sections: [...LISTS_SECTIONS],
  allowColumns: false,
  allowDensity: true,
  defaultPreferences: preferences({
    layoutPreset: "organiser",
    visibleSections: listsAllVisible,
  }),
  presets: [
    {
      id: "organiser",
      label: "Organiser",
      description:
        "Shows creation, Learning Queue, clean-up prompts, filters, and list cards.",
      preferences: preferences({
        layoutPreset: "organiser",
        visibleSections: listsAllVisible,
      }),
    },
    {
      id: "management",
      label: "Management",
      description:
        "Keeps every list-management and learning-queue surface visible.",
      preferences: preferences({
        layoutPreset: "management",
        visibleSections: listsAllVisible,
      }),
    },
    {
      id: "minimal",
      label: "Minimal",
      description: "Shows only filters and list results.",
      preferences: preferences({
        layoutPreset: "minimal",
        density: "compact",
        visibleSections: visibleSections({
          create_list: false,
          status_messages: true,
          summary_grid: false,
          filters: true,
          results_header: true,
          list_results: true,
        }),
      }),
    },
  ],
}