import type { PageOptionsConfig } from "@/lib/page-options/types"
import { preferences, visibleSections } from "./shared"

const TUNE_DETAIL_SECTIONS = [
  {
    id: "tune_state",
    label: "Tune state",
    description: "Practice, known, list count, and main tune actions.",
    isCore: true,
  },
  {
    id: "tune_review",
    label: "Review / practice check",
    description:
      "Formal review for tunes already in practice, or diary-only checks for other tunes.",
  },
  {
    id: "canonical_details",
    label: "Canonical details",
    description:
      "Shared tune metadata such as key, style, time signature, and reference URL.",
    isCore: true,
  },
  {
    id: "my_notes",
    label: "My notes",
    description: "Your stable private notes for this tune.",
  },
  {
    id: "practice_history",
    label: "Practice history",
    description: "Dated notes from your Practice Diary for this tune.",
  },
  {
    id: "media_links",
    label: "Media links",
    description: "Reference recordings and other tune-linked media.",
  },
  {
    id: "sheet_music",
    label: "Sheet music / tab",
    description: "Sheet music, tab, and chart links.",
  },
  {
    id: "lore",
    label: "Lore",
    description:
      "Community tune lore, source notes, alternate titles, and history.",
  },
  {
    id: "comments",
    label: "Comments",
    description: "Community discussion for this tune.",
  },
] as const

const tuneDetailAllVisible = visibleSections({
  tune_state: true,
  tune_review: true,
  canonical_details: true,
  my_notes: true,
  practice_history: true,
  media_links: true,
  sheet_music: true,
  lore: true,
  comments: true,
})

export const TUNE_DETAIL_PAGE_OPTIONS_CONFIG: PageOptionsConfig = {
  pageKey: "tune_detail",
  title: "Tune Page Options",
  description: "Choose which sections appear on tune detail pages.",
  helperText:
    "These settings apply to every tune detail page. They do not change canonical tune data.",
  sections: [...TUNE_DETAIL_SECTIONS],
  allowColumns: true,
  allowDensity: true,
  defaultPreferences: preferences({
    layoutPreset: "working",
    visibleSections: tuneDetailAllVisible,
  }),
  presets: [
    {
      id: "working",
      label: "Working View",
      description:
        "Shows practice state, review, notes, media, lore, and comments.",
      preferences: preferences({
        layoutPreset: "working",
        visibleSections: tuneDetailAllVisible,
      }),
    },
    {
      id: "reference",
      label: "Reference View",
      description: "Prioritises canonical details, media, sheet music, and lore.",
      preferences: preferences({
        layoutPreset: "reference",
        visibleSections: visibleSections({
          tune_state: true,
          tune_review: false,
          canonical_details: true,
          my_notes: false,
          practice_history: false,
          media_links: true,
          sheet_music: true,
          lore: true,
          comments: false,
        }),
      }),
    },
    {
      id: "practice_first",
      label: "Practice First",
      description: "Prioritises tune state, review, notes, and practice history.",
      preferences: preferences({
        layoutPreset: "practice_first",
        visibleSections: visibleSections({
          tune_state: true,
          tune_review: true,
          canonical_details: true,
          my_notes: true,
          practice_history: true,
          media_links: true,
          sheet_music: false,
          lore: false,
          comments: false,
        }),
      }),
    },
    {
      id: "community",
      label: "Community View",
      description:
        "Prioritises lore, comments, media links, and public tune context.",
      preferences: preferences({
        layoutPreset: "community",
        visibleSections: visibleSections({
          tune_state: true,
          tune_review: false,
          canonical_details: true,
          my_notes: false,
          practice_history: false,
          media_links: true,
          sheet_music: true,
          lore: true,
          comments: true,
        }),
      }),
    },
    {
      id: "minimal",
      label: "Minimal",
      description: "Shows only the main tune state and canonical tune details.",
      preferences: preferences({
        layoutPreset: "minimal",
        columnMode: "comfortable",
        density: "compact",
        visibleSections: visibleSections({
          tune_state: true,
          tune_review: false,
          canonical_details: true,
          my_notes: false,
          practice_history: false,
          media_links: false,
          sheet_music: false,
          lore: false,
          comments: false,
        }),
      }),
    },
  ],
}