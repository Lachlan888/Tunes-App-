import type { PageOptionsConfig } from "@/lib/page-options/types"
import { preferences, visibleSections } from "./shared"

const SETLISTS_SECTIONS = [
  {
    id: "create_setlist",
    label: "Create setlist",
    description: "The setlist creation action in the masthead.",
  },
  {
    id: "status_messages",
    label: "Status messages",
    description: "Feedback after setlist and invitation actions.",
  },
  {
    id: "pending_invites",
    label: "Pending invitations",
    description: "Invitations to collaborate on setlists.",
  },
  {
    id: "setlists",
    label: "Your setlists",
    description: "The setlists you own or collaborate on.",
    isCore: true,
  },
] as const

const setlistsAllVisible = visibleSections({
  create_setlist: true,
  status_messages: true,
  pending_invites: true,
  setlists: true,
})

export const SETLISTS_PAGE_OPTIONS_CONFIG: PageOptionsConfig = {
  pageKey: "setlists",
  title: "Setlists display options",
  description: "Choose how your setlist workspace is arranged.",
  helperText:
    "These settings only affect the Setlists page layout. They do not change setlists or invitations.",
  sections: [...SETLISTS_SECTIONS],
  allowColumns: false,
  allowDensity: true,
  defaultPreferences: preferences({
    layoutPreset: "management",
    visibleSections: setlistsAllVisible,
  }),
  presets: [
    {
      id: "management",
      label: "Management",
      description: "Shows creation, invitations, and your setlists.",
      preferences: preferences({
        layoutPreset: "management",
        visibleSections: setlistsAllVisible,
      }),
    },
    {
      id: "minimal",
      label: "Minimal",
      description: "Shows only invitations and setlists.",
      preferences: preferences({
        layoutPreset: "minimal",
        density: "compact",
        visibleSections: visibleSections({
          create_setlist: false,
          status_messages: true,
          pending_invites: true,
          setlists: true,
        }),
      }),
    },
  ],
}
