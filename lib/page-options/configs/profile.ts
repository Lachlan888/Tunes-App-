import type { PageOptionsConfig } from "@/lib/page-options/types"
import { preferences, visibleSections } from "./shared"

const PROFILE_SECTIONS = [
  {
    id: "profile_editor",
    label: "Profile editor",
    description: "The private profile, instruments, and visibility editor.",
    isCore: true,
  },
] as const

const profileAllVisible = visibleSections({
  profile_editor: true,
})

export const PROFILE_PAGE_OPTIONS_CONFIG: PageOptionsConfig = {
  pageKey: "profile",
  title: "Profile display options",
  description: "Choose how your private profile page is shown.",
  helperText:
    "These settings only affect the Profile page view. They do not change public visibility settings.",
  sections: [...PROFILE_SECTIONS],
  allowColumns: false,
  allowDensity: true,
  defaultPreferences: preferences({
    layoutPreset: "settings",
    visibleSections: profileAllVisible,
  }),
  presets: [
    {
      id: "settings",
      label: "Settings",
      description: "Shows the full profile settings editor.",
      preferences: preferences({
        layoutPreset: "settings",
        visibleSections: profileAllVisible,
      }),
    },
    {
      id: "minimal",
      label: "Minimal",
      description: "Keeps the profile page focused on the editor.",
      preferences: preferences({
        layoutPreset: "minimal",
        density: "compact",
        visibleSections: profileAllVisible,
      }),
    },
  ],
}
