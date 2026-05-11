import type {
  PageColumnMode,
  PageDensity,
  PageKey,
  PageLayoutPresetId,
  PageOptionsConfig,
  PageOptionsPreferences,
  PageVisibleSections,
} from "@/lib/page-options/types"

const DEFAULT_COLUMN_MODE: PageColumnMode = "auto"
const DEFAULT_DENSITY: PageDensity = "standard"

function visibleSections(
  sections: Record<string, boolean>
): PageVisibleSections {
  return sections
}

function preferences(options: {
  layoutPreset: PageLayoutPresetId
  columnMode?: PageColumnMode
  density?: PageDensity
  visibleSections: PageVisibleSections
}): PageOptionsPreferences {
  return {
    layoutPreset: options.layoutPreset,
    columnMode: options.columnMode ?? DEFAULT_COLUMN_MODE,
    density: options.density ?? DEFAULT_DENSITY,
    visibleSections: options.visibleSections,
  }
}

const HOME_SECTIONS = [
  {
    id: "repertoire_state",
    label: "Repertoire state",
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
  title: "Home Page Options",
  description: "Choose what Home prioritises when you open the app.",
  helperText:
    "These settings only affect how Home is arranged. They do not change your tunes, lists, practice state, or review schedule.",
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
        "Prioritises due tunes, catch-up pressure, current practice, and streaks.",
      preferences: preferences({
        layoutPreset: "practice_first",
        visibleSections: visibleSections({
          repertoire_state: true,
          due_next: true,
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
        "Prioritises lists, repertoire state, and current practice organisation.",
      preferences: preferences({
        layoutPreset: "organiser",
        visibleSections: visibleSections({
          repertoire_state: true,
          due_next: true,
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
    description: "List overview and unlisted-tune organisation prompts.",
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
    "These settings affect only how the Lists page is shown. They do not change list contents or visibility.",
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
      description: "Shows creation, clean-up prompts, filters, and list cards.",
      preferences: preferences({
        layoutPreset: "organiser",
        visibleSections: listsAllVisible,
      }),
    },
    {
      id: "management",
      label: "Management",
      description: "Keeps every management surface visible.",
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

const PRACTICE_SECTIONS = [
  {
    id: "practice_nav",
    label: "Practice navigation",
    description: "Links between Review, Diary, and future practice surfaces.",
  },
  {
    id: "streaks",
    label: "Streaks",
    description: "Revision and practice streak cards.",
  },
  {
    id: "status_messages",
    label: "Status messages",
    description: "Feedback after updating practice state.",
  },
  {
    id: "catch_up",
    label: "Catch-up",
    description: "Overdue tunes waiting for review.",
    isCore: true,
  },
  {
    id: "due_today",
    label: "Due today",
    description: "Tunes scheduled for review today.",
    isCore: true,
  },
  {
    id: "active_practice",
    label: "Active practice",
    description: "All tunes currently inside the practice system.",
  },
] as const

const practiceAllVisible = visibleSections({
  practice_nav: true,
  streaks: true,
  status_messages: true,
  catch_up: true,
  due_today: true,
  active_practice: true,
})

export const PRACTICE_PAGE_OPTIONS_CONFIG: PageOptionsConfig = {
  pageKey: "practice",
  title: "Practice Page Options",
  description: "Choose how the Practice page prioritises review work.",
  helperText:
    "Practice options only change the view. Review scheduling, due dates, and stages are unchanged.",
  sections: [...PRACTICE_SECTIONS],
  allowColumns: false,
  allowDensity: true,
  defaultPreferences: preferences({
    layoutPreset: "review",
    visibleSections: practiceAllVisible,
  }),
  presets: [
    {
      id: "review",
      label: "Review",
      description: "Shows the full practice workflow.",
      preferences: preferences({
        layoutPreset: "review",
        visibleSections: practiceAllVisible,
      }),
    },
    {
      id: "practice_first",
      label: "Practice First",
      description: "Prioritises catch-up and due-today work.",
      preferences: preferences({
        layoutPreset: "practice_first",
        visibleSections: visibleSections({
          practice_nav: true,
          streaks: true,
          status_messages: true,
          catch_up: true,
          due_today: true,
          active_practice: false,
        }),
      }),
    },
    {
      id: "minimal",
      label: "Minimal",
      description: "Shows only the core review queues.",
      preferences: preferences({
        layoutPreset: "minimal",
        density: "compact",
        visibleSections: visibleSections({
          practice_nav: true,
          streaks: false,
          status_messages: true,
          catch_up: true,
          due_today: true,
          active_practice: false,
        }),
      }),
    },
  ],
}

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
  title: "Setlists Page Options",
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

const SHARED_SECTIONS = [
  {
    id: "shared_header",
    label: "Shared header",
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
  title: "Shared Page Options",
  description: "Choose how public list discovery is shown.",
  helperText:
    "These settings only affect the Shared page view. They do not change public-list visibility.",
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
  title: "Profile Page Options",
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

const MODERATOR_SECTIONS = [
  {
    id: "summary_counts",
    label: "Summary counts",
    description: "Counts for pending edit requests, comment reports, and lore reports.",
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
  title: "Moderator Page Options",
  description: "Choose which moderation queues are visible.",
  helperText:
    "These settings only affect the Moderator page view. They do not action or dismiss reports.",
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
      description: "Shows all moderation queues.",
      preferences: preferences({
        layoutPreset: "triage",
        visibleSections: moderatorAllVisible,
      }),
    },
    {
      id: "tune_edits",
      label: "Tune Edits",
      description: "Focuses on canonical tune edit requests.",
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
      description: "Focuses on comment and lore reports.",
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
      description: "Shows queue counts only.",
      preferences: preferences({
        layoutPreset: "minimal",
        density: "compact",
        visibleSections: visibleSections({
          summary_counts: true,
          tune_edit_requests: false,
          comment_reports: false,
          lore_reports: false,
        }),
      }),
    },
  ],
}

export const PAGE_OPTIONS_CONFIGS = [
  HOME_PAGE_OPTIONS_CONFIG,
  LIBRARY_PAGE_OPTIONS_CONFIG,
  TUNE_DETAIL_PAGE_OPTIONS_CONFIG,
  LISTS_PAGE_OPTIONS_CONFIG,
  PRACTICE_PAGE_OPTIONS_CONFIG,
  SETLISTS_PAGE_OPTIONS_CONFIG,
  BADGES_PAGE_OPTIONS_CONFIG,
  COMPARE_PAGE_OPTIONS_CONFIG,
  SHARED_PAGE_OPTIONS_CONFIG,
  PROFILE_PAGE_OPTIONS_CONFIG,
  MODERATOR_PAGE_OPTIONS_CONFIG,
] as const

export function getPageOptionsConfig(pageKey: PageKey) {
  return PAGE_OPTIONS_CONFIGS.find((config) => config.pageKey === pageKey)
}

function isColumnMode(value: unknown): value is PageColumnMode {
  return (
    value === "auto" ||
    value === "compact" ||
    value === "comfortable" ||
    value === "wide"
  )
}

function isDensity(value: unknown): value is PageDensity {
  return value === "spacious" || value === "standard" || value === "compact"
}

function isPresetId(
  value: unknown,
  config: PageOptionsConfig
): value is PageLayoutPresetId {
  return config.presets.some((preset) => preset.id === value)
}

function normaliseVisibleSections(
  rawVisibleSections: unknown,
  config: PageOptionsConfig
): PageVisibleSections {
  const visibleSectionRecord =
    rawVisibleSections &&
    typeof rawVisibleSections === "object" &&
    !Array.isArray(rawVisibleSections)
      ? (rawVisibleSections as Record<string, unknown>)
      : {}

  const normalisedSections: PageVisibleSections = {}

  for (const section of config.sections) {
    const rawValue = visibleSectionRecord[section.id]

    normalisedSections[section.id] =
      typeof rawValue === "boolean"
        ? rawValue
        : config.defaultPreferences.visibleSections[section.id] ?? true
  }

  return normalisedSections
}

export function normalisePageOptionsPreferences(
  rawPreferences: unknown,
  config: PageOptionsConfig
): PageOptionsPreferences {
  const raw =
    rawPreferences &&
    typeof rawPreferences === "object" &&
    !Array.isArray(rawPreferences)
      ? (rawPreferences as Record<string, unknown>)
      : {}

  return {
    layoutPreset: isPresetId(raw.layoutPreset, config)
      ? raw.layoutPreset
      : config.defaultPreferences.layoutPreset,
    columnMode: isColumnMode(raw.columnMode)
      ? raw.columnMode
      : config.defaultPreferences.columnMode,
    density: isDensity(raw.density)
      ? raw.density
      : config.defaultPreferences.density,
    visibleSections: normaliseVisibleSections(raw.visibleSections, config),
  }
}