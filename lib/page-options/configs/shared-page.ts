import type { PageOptionsConfig } from "@/lib/page-options/types"
import { preferences, visibleSections } from "./shared"

const SHARED_SECTIONS = [
  {
    id: "shared_header",
    label: "Public Lists header",
    description: "The public-list discovery masthead.",
  },
  {
    id: "public_lists",
    label: "Public lists",
    description: "The public list cards.",
    isCore: true,
  },
  {
    id: "empty_state",
    label: "Empty state",
    description: "Guidance shown when no public lists are available.",
  },
] as const

const sharedAllVisible = visibleSections({
  shared_header: true,
  public_lists: true,
  empty_state: true,
})

export const SHARED_PAGE_OPTIONS_CONFIG: PageOptionsConfig = {
  pageKey: "shared",
  title: "Public Lists Page Options",
  description: "Choose how public list discovery is shown.",
  helperText:
    "These settings only affect the Public Lists page view. They do not change public-list visibility.",
  sections: [...SHARED_SECTIONS],
  allowColumns: false,
  allowDensity: true,
  defaultPreferences: preferences({
    layoutPreset: "discovery",
    visibleSections: sharedAllVisible,
  }),
  presets: [
    {
      id: "discovery",
      label: "Discovery",
      description: "Shows the full public-list discovery surface.",
      preferences: preferences({
        layoutPreset: "discovery",
        visibleSections: sharedAllVisible,
      }),
    },
    {
      id: "minimal",
      label: "Minimal",
      description: "Shows only the public-list cards.",
      preferences: preferences({
        layoutPreset: "minimal",
        density: "compact",
        visibleSections: visibleSections({
          shared_header: false,
          public_lists: true,
          empty_state: true,
        }),
      }),
    },
  ],
}