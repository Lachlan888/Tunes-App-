import type { PageOptionsConfig } from "@/lib/page-options/types"
import { preferences, visibleSections } from "./shared"

const HOME_SECTIONS = [
  {
    id: "repertoire_state",
    label: "Repertoire",
    description: "Known, Practice, Due today, Attention, and Lists summary.",
    isCore: true,
  },
  {
    id: "due_next",
    label: "Due next",
    description: "The next due tunes that need review attention.",
    isCore: true,
  },
  {
    id: "learning_queue",
    label: "Learning queue",
    description:
      "Tunes saved in lists but not yet started in Practice or marked Known.",
  },
  {
    id: "currently_in_practice",
    label: "Currently in practice",
    description: "A small preview of tunes inside the review system.",
  },
  {
    id: "streaks",
    label: "Streaks",
    description: "Revision and practice streak cards.",
  },
  {
    id: "badges",
    label: "Badges",
    description: "Badges received and badges you award.",
  },
  {
    id: "lists",
    label: "Your lists",
    description: "A small preview of your tune lists.",
  },
  {
    id: "friend_activity",
    label: "Friend activity",
    description: "Recent activity from accepted friends.",
  },
  {
    id: "getting_started",
    label: "Getting started",
    description: "Guidance shown when the account is still being set up.",
  },
  {
    id: "signed_in_card",
    label: "Signed-in card",
    description: "The account card in the Home masthead.",
  },
] as const

const homeAllVisible = visibleSections({
  repertoire_state: true,
  due_next: true,
  learning_queue: true,
  currently_in_practice: true,
  streaks: true,
  badges: true,
  lists: true,
  friend_activity: true,
  getting_started: true,
  signed_in_card: true,
})

export const HOME_PAGE_OPTIONS_CONFIG: PageOptionsConfig = {
  pageKey: "home",
  title: "Home display options",
  description: "Choose what Home prioritises when you open the app.",
  helperText:
    "These settings only affect how Home is arranged. They do not change your tunes, lists, practice status, or review schedule.",
  sections: [...HOME_SECTIONS],
  allowColumns: true,
  allowDensity: true,
  defaultPreferences: preferences({
    layoutPreset: "balanced",
    visibleSections: homeAllVisible,
  }),
  presets: [
    {
      id: "balanced",
      label: "Balanced Dashboard",
      description:
        "A general overview of repertoire, practice, lists, badges, and social activity.",
      preferences: preferences({
        layoutPreset: "balanced",
        visibleSections: homeAllVisible,
      }),
    },
    {
      id: "practice_first",
      label: "Practice First",
      description:
        "Prioritises due tunes, learning queue, catch-up pressure, current practice, and streaks.",
      preferences: preferences({
        layoutPreset: "practice_first",
        visibleSections: visibleSections({
          repertoire_state: true,
          due_next: true,
          learning_queue: true,
          currently_in_practice: true,
          streaks: true,
          badges: false,
          lists: false,
          friend_activity: false,
          getting_started: true,
          signed_in_card: true,
        }),
      }),
    },
    {
      id: "organiser",
      label: "Organiser",
      description:
        "Prioritises lists, learning queue, repertoire, and current practice organisation.",
      preferences: preferences({
        layoutPreset: "organiser",
        visibleSections: visibleSections({
          repertoire_state: true,
          due_next: true,
          learning_queue: true,
          currently_in_practice: true,
          streaks: false,
          badges: false,
          lists: true,
          friend_activity: false,
          getting_started: true,
          signed_in_card: true,
        }),
      }),
    },
    {
      id: "social",
      label: "Social",
      description:
        "Prioritises friend activity, badges, and community-facing signals.",
      preferences: preferences({
        layoutPreset: "social",
        visibleSections: visibleSections({
          repertoire_state: true,
          due_next: true,
          learning_queue: false,
          currently_in_practice: false,
          streaks: true,
          badges: true,
          lists: true,
          friend_activity: true,
          getting_started: true,
          signed_in_card: true,
        }),
      }),
    },
    {
      id: "minimal",
      label: "Minimal",
      description:
        "Keeps Home quiet and focused on the most important practice signals.",
      preferences: preferences({
        layoutPreset: "minimal",
        columnMode: "comfortable",
        density: "compact",
        visibleSections: visibleSections({
          repertoire_state: true,
          due_next: true,
          learning_queue: false,
          currently_in_practice: false,
          streaks: false,
          badges: false,
          lists: false,
          friend_activity: false,
          getting_started: true,
          signed_in_card: false,
        }),
      }),
    },
  ],
}
