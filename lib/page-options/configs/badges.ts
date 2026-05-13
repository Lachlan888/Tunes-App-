import type { PageOptionsConfig } from "@/lib/page-options/types"
import { preferences, visibleSections } from "./shared"

const BADGES_SECTIONS = [
  {
    id: "create_badge",
    label: "Create badge action",
    description: "The create-badge or login action in the masthead.",
  },
  {
    id: "status_messages",
    label: "Status messages",
    description: "Feedback after creating or deleting badges.",
  },
  {
    id: "badge_browser",
    label: "Badge browser",
    description: "The main public badge browsing surface.",
    isCore: true,
  },
  {
    id: "empty_state",
    label: "Empty state",
    description: "Guidance shown when no badges exist.",
  },
] as const

const badgesAllVisible = visibleSections({
  create_badge: true,
  status_messages: true,
  badge_browser: true,
  empty_state: true,
})

export const BADGES_PAGE_OPTIONS_CONFIG: PageOptionsConfig = {
  pageKey: "badges",
  title: "Badges Page Options",
  description: "Choose how the Badges page is arranged.",
  helperText:
    "These settings affect only badge browsing layout. They do not create, award, or remove badges.",
  sections: [...BADGES_SECTIONS],
  allowColumns: false,
  allowDensity: true,
  defaultPreferences: preferences({
    layoutPreset: "community",
    visibleSections: badgesAllVisible,
  }),
  presets: [
    {
      id: "community",
      label: "Community",
      description: "Shows creation status and the full badge browser.",
      preferences: preferences({
        layoutPreset: "community",
        visibleSections: badgesAllVisible,
      }),
    },
    {
      id: "minimal",
      label: "Minimal",
      description: "Focuses on the badge browser only.",
      preferences: preferences({
        layoutPreset: "minimal",
        density: "compact",
        visibleSections: visibleSections({
          create_badge: false,
          status_messages: true,
          badge_browser: true,
          empty_state: true,
        }),
      }),
    },
  ],
}