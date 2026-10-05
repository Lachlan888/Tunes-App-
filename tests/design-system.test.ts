import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import test from "node:test"

const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8")

function tokenHex(name: string) {
  const match = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6});`))
  assert.ok(match, `Expected --${name} to be a six-digit hex token`)
  return match[1]
}

function luminance(hex: string) {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)!
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4
    )

  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
}

function contrast(first: string, second: string) {
  const light = Math.max(luminance(first), luminance(second))
  const dark = Math.min(luminance(first), luminance(second))
  return (light + 0.05) / (dark + 0.05)
}

test("foundation tokens keep the specified semantic values", () => {
  assert.deepEqual(
    {
      canvas: tokenHex("surface-canvas").toUpperCase(),
      paper: tokenHex("surface-paper").toUpperCase(),
      note: tokenHex("surface-note").toUpperCase(),
      ink: tokenHex("text-primary").toUpperCase(),
      mutedInk: tokenHex("text-muted").toUpperCase(),
      hairline: tokenHex("hairline").toUpperCase(),
      umber: tokenHex("action-primary").toUpperCase(),
      umberHover: tokenHex("action-primary-hover").toUpperCase(),
      moss: tokenHex("state-known").toUpperCase(),
      river: tokenHex("state-practice").toUpperCase(),
      ochre: tokenHex("state-due").toUpperCase(),
      rust: tokenHex("state-overdue").toUpperCase(),
      plum: tokenHex("state-social").toUpperCase(),
      oxblood: tokenHex("action-destructive").toUpperCase(),
    },
    {
      canvas: "#F4EFE4",
      paper: "#FFFDF8",
      note: "#E9E1D3",
      ink: "#25231F",
      mutedInk: "#675F55",
      hairline: "#D3C7B5",
      umber: "#5B4325",
      umberHover: "#49351D",
      moss: "#68754A",
      river: "#466A78",
      ochre: "#C18B32",
      rust: "#A9533E",
      plum: "#755B72",
      oxblood: "#8E3934",
    }
  )
})

test("ordinary text and filled semantic controls meet WCAG AA contrast", () => {
  const pairings = [
    ["ink on paper", "text-primary", "surface-paper"],
    ["muted ink on paper", "text-muted", "surface-paper"],
    ["muted ink on note", "text-muted", "surface-note"],
    ["paper on primary action", "surface-paper", "action-primary"],
    ["paper on known", "surface-paper", "state-known"],
    ["paper on practice", "surface-paper", "state-practice"],
    ["ink on due", "text-primary", "state-due"],
    ["paper on overdue", "surface-paper", "state-overdue"],
    ["paper on social", "surface-paper", "state-social"],
    ["paper on destructive", "surface-paper", "action-destructive"],
  ] as const

  for (const [label, foreground, background] of pairings) {
    const ratio = contrast(tokenHex(foreground), tokenHex(background))
    assert.ok(ratio >= 4.5, `${label} is ${ratio.toFixed(2)}:1, below 4.5:1`)
  }
})

test("accessibility preference fallbacks are defined", () => {
  assert.match(css, /prefers-reduced-motion:\s*reduce/)
  assert.match(css, /prefers-reduced-transparency:\s*reduce/)
  assert.match(css, /prefers-contrast:\s*more/)
  assert.match(css, /forced-colors:\s*active/)
})

test("reference loop controls keep named groups and 44px phone targets", () => {
  const player = readFileSync(
    join(process.cwd(), "components/library/YouTubeLoopPlayer.tsx"),
    "utf8"
  )

  assert.match(player, /role="group" aria-label="Loop pedal controls"/)
  assert.match(player, /role="group" aria-label="Loop range controls"/)
  assert.match(player, /aria-pressed=\{isPlaying\}/)
  assert.match(player, /className="min-h-11 min-w-11 rounded-md border/)
  assert.match(player, /joinClasses\("min-h-11 min-w-11 rounded-md border px-3/)
  assert.match(player, /className="grid h-11 w-11 place-items-center/)
})

test("visible practice navigation uses the source-of-truth Focus areas name", () => {
  const accountMenu = readFileSync(
    join(process.cwd(), "components/layout/AccountMenu.tsx"),
    "utf8"
  )

  assert.match(accountMenu, /label: "Focus areas"/)
  assert.doesNotMatch(accountMenu, /label: "Focus Areas"/)
})

test("focused Practice keeps beta feedback reachable without covering ratings", () => {
  const focusModeShell = readFileSync(
    join(process.cwd(), "components/practice/FocusModeShell.tsx"),
    "utf8"
  )
  const feedbackButton = readFileSync(
    join(process.cwd(), "components/feedback/FloatingFeedbackButton.tsx"),
    "utf8"
  )
  const appHeader = readFileSync(
    join(process.cwd(), "components/layout/AppHeader.tsx"),
    "utf8"
  )

  assert.match(focusModeShell, /FloatingFeedbackButton variant="focus"/)
  assert.match(appHeader, /FloatingFeedbackButton variant="header"/)
  assert.match(feedbackButton, /variant\?: "floating" \| "menu" \| "focus" \| "header" \| "hidden"/)
  assert.match(feedbackButton, /hidden[^\"]*md:inline-flex md:bottom-auto md:top-6/)
  assert.match(feedbackButton, /<span className="lg:hidden">Feedback<\/span>/)
  assert.match(feedbackButton, /<span className="hidden lg:inline">Help & feedback<\/span>/)
  assert.match(feedbackButton, /md:bottom-auto md:top-6/)
  assert.doesNotMatch(feedbackButton, /lg:bottom-|lg:top-auto/)
  assert.doesNotMatch(feedbackButton, /rounded-pill/)

  const feedbackModal = readFileSync(
    join(process.cwd(), "components/feedback/BetaFeedbackModal.tsx"),
    "utf8"
  )
  assert.match(feedbackModal, /ResponsiveModal/)
  assert.doesNotMatch(feedbackModal, /fixed inset-0|shadow-2xl/)
})

test("account settings and Trends use flat editorial regions at every query state", () => {
  const dashboard = readFileSync(
    join(process.cwd(), "app/dashboard/page.tsx"),
    "utf8"
  )
  const settingsForm = readFileSync(
    join(process.cwd(), "components/settings/SettingsForm.tsx"),
    "utf8"
  )
  const trends = readFileSync(
    join(process.cwd(), "components/trends/PersonalTrendInsights.tsx"),
    "utf8"
  )
  const trendDetail = readFileSync(
    join(process.cwd(), "app/trends/[style]/page.tsx"),
    "utf8"
  )
  const trendTunes = readFileSync(
    join(process.cwd(), "components/trends/TrendTuneList.tsx"),
    "utf8"
  )

  assert.doesNotMatch(dashboard, /rounded-(?:xl|2xl)|bg-card/)
  assert.doesNotMatch(settingsForm, /rounded-xl/)
  assert.doesNotMatch(trends, /eyebrow|uppercase|font-serif|rounded-full|border-y/)
  assert.match(trends, /function InsightHeader\(\{[\s\S]*id,[\s\S]*<h2 id=\{id\}/)
  assert.match(trends, /section className="min-w-0" aria-labelledby="practice-volume-title"/)
  assert.doesNotMatch(trendDetail, /uppercase|font-serif|border-y/)
  assert.doesNotMatch(trendTunes, /rounded-(?:2xl|full)|font-serif|shadow-sm|border-y/)
})

test("named status and control containers expose semantics instead of labelling generic elements", () => {
  const setlistCard = readFileSync(
    join(process.cwd(), "components/setlists/SetlistOverviewCard.tsx"),
    "utf8"
  )
  const tuneActions = readFileSync(
    join(process.cwd(), "components/library/TuneDetailActions.tsx"),
    "utf8"
  )
  const sessionDockShowcase = readFileSync(
    join(process.cwd(), "components/session-dock/SessionDockShowcase.tsx"),
    "utf8"
  )

  assert.match(setlistCard, /role="group" aria-label="Your private readiness"/)
  assert.match(tuneActions, /role="status"[^>]+aria-label="This tune is marked as known"/)
  assert.match(sessionDockShowcase, /role="group" aria-label="Session Dock preview context"/)
})

test("design guidance prohibits decorative eyebrow labels", () => {
  const direction = readFileSync(
    join(
      process.cwd(),
      "docs/Tunes App — Full UI/UX Audit and 2026 Product Design Direction.md"
    ),
    "utf8"
  )
  const context = readFileSync(
    join(process.cwd(), "docs/Tunes-App-Current-Context.md"),
    "utf8"
  )

  assert.match(direction, /Do not use decorative eyebrow labels/)
  assert.match(context, /decorative eyebrow labels are prohibited/)
  assert.match(context, /Begin with the real heading/)
})

test("editorial foundations are implemented by primitives instead of global wrapper disguises", () => {
  const cards = readFileSync(
    join(process.cwd(), "components/ui/cardStyles.ts"),
    "utf8"
  )

  assert.doesNotMatch(css, /:is\(article, section, aside, details, div\):is/)
  assert.doesNotMatch(css, /:is\(article, section, aside, details\):is/)
  assert.doesNotMatch(css, /main :is\(button, a, input, select, textarea\)/)
  assert.match(cards, /clickableCard:/)
  assert.match(cards, /border-b border-hairline/)
  assert.match(cards, /modal:/)
  assert.match(cards, /bg-surface-paper/)
})

test("Diary period views and Focus detail use editorial regions instead of nested cards", () => {
  const week = readFileSync(
    join(process.cwd(), "components/practice-diary/PracticeWeekView.tsx"),
    "utf8"
  )
  const month = readFileSync(
    join(process.cwd(), "components/practice-diary/PracticeMonthView.tsx"),
    "utf8"
  )
  const tuneSummaries = readFileSync(
    join(process.cwd(), "components/practice-diary/PracticeTuneSummaryList.tsx"),
    "utf8"
  )
  const categorySummaries = readFileSync(
    join(process.cwd(), "components/practice-diary/PracticeCategorySummaryList.tsx"),
    "utf8"
  )
  const focusDetail = readFileSync(
    join(process.cwd(), "components/practice-foci/PracticeFocusDetail.tsx"),
    "utf8"
  )
  const focusActions = readFileSync(
    join(process.cwd(), "components/practice-foci/FocusActionMenu.tsx"),
    "utf8"
  )

  assert.doesNotMatch(week, /rounded-full|font-serif|uppercase/)
  assert.doesNotMatch(month, /rounded-full|shadow-sm|uppercase/)
  assert.doesNotMatch(tuneSummaries, /rounded-2xl|shadow-sm|font-serif|uppercase/)
  assert.doesNotMatch(categorySummaries, /rounded-(?:xl|2xl|full)|bg-card/)
  assert.doesNotMatch(focusDetail, /md:rounded-3xl|md:shadow-sm|uppercase/)
  assert.doesNotMatch(
    focusActions,
    /md:flex md:items-center md:justify-between md:rounded-3xl/
  )
  assert.doesNotMatch(focusActions, /Current focus/)
})

test("Diary and Focus overlays use the shared accessible modal and flat editorial controls", () => {
  const categoryManager = readFileSync(
    join(process.cwd(), "components/practice-diary/PracticeCategoryManager.tsx"),
    "utf8"
  )
  const noteForm = readFileSync(
    join(process.cwd(), "components/practice-diary/PracticeNoteForm.tsx"),
    "utf8"
  )
  const reviewNote = readFileSync(
    join(process.cwd(), "components/practice/ReviewNoteModal.tsx"),
    "utf8"
  )
  const focusActions = readFileSync(
    join(process.cwd(), "components/practice-foci/FocusActionMenu.tsx"),
    "utf8"
  )
  const focusTunes = readFileSync(
    join(process.cwd(), "components/practice-foci/PracticeFocusTuneManager.tsx"),
    "utf8"
  )

  for (const source of [focusActions, focusTunes]) {
    assert.match(source, /ResponsiveModal/)
    assert.doesNotMatch(source, /fixed inset-0|rounded-3xl|shadow-xl|font-serif|uppercase/)
  }
  assert.doesNotMatch(focusActions, /onOpenPicker\(\)[\s\S]{0,80}onClose\(\)/)
  assert.match(focusActions, /const closeActions = useCallback/)
  assert.match(focusActions, /const closePicker = useCallback/)

  for (const source of [categoryManager, noteForm, reviewNote]) {
    assert.doesNotMatch(source, /rounded-(?:xl|2xl|full)|shadow-sm|font-serif|uppercase/)
  }
})

test("Metronome controls read as restrained equipment rather than nested SaaS cards", () => {
  const metronome = readFileSync(
    join(process.cwd(), "components/practice/PracticeMetronome.tsx"),
    "utf8"
  )
  const floatingTool = readFileSync(
    join(process.cwd(), "components/ui/FloatingTool.tsx"),
    "utf8"
  )

  assert.doesNotMatch(metronome, /rounded-(?:xl|2xl)|shadow-sm|uppercase/)
  assert.match(metronome, /border-y border-hairline/)
  assert.match(floatingTool, /\[aria-label="Open account menu"\]/)
  assert.match(floatingTool, /returnTarget\?\.focus/)
})

test("Diary category detail and saved notes use flat editorial rows", () => {
  const categoryDetail = readFileSync(
    join(process.cwd(), "components/practice-diary/PracticeCategoryDetail.tsx"),
    "utf8"
  )
  const noteCard = readFileSync(
    join(process.cwd(), "components/practice-diary/PracticeNoteCard.tsx"),
    "utf8"
  )
  const eventList = readFileSync(
    join(process.cwd(), "components/practice-diary/PracticeEventList.tsx"),
    "utf8"
  )

  for (const source of [categoryDetail, noteCard, eventList]) {
    assert.doesNotMatch(source, /rounded-(?:xl|2xl|3xl|full)|shadow-sm|font-serif|uppercase/)
  }
  assert.match(categoryDetail, /divide-x divide-hairline/)
  assert.match(categoryDetail, /flex-col gap-3 sm:flex-row/)
  assert.match(noteCard, /border-l-2 border-state-practice/)
})

test("Tunes catalogue and detail use flat editorial regions", () => {
  const libraryList = readFileSync(join(process.cwd(), "components/library/LibraryList.tsx"), "utf8")
  const preview = readFileSync(join(process.cwd(), "components/library/CataloguePreview.tsx"), "utf8")
  const privateNotes = readFileSync(join(process.cwd(), "components/library/TunePrivateNotesSection.tsx"), "utf8")
  const practiceHistory = readFileSync(join(process.cwd(), "components/practice-diary/TunePracticeHistorySection.tsx"), "utf8")
  const inlineDetails = readFileSync(join(process.cwd(), "components/library/TuneInlineDetails.tsx"), "utf8")

  assert.doesNotMatch(libraryList, /rounded-object bg-surface-paper|shadow-material-rest/)
  assert.doesNotMatch(preview, /font-serif|uppercase|bg-surface-note|rounded-object/)
  for (const source of [privateNotes, practiceHistory, inlineDetails]) {
    assert.doesNotMatch(source, /rounded-(?:2xl|3xl|object|full)|shadow-sm|font-serif|uppercase|bg-surface-note/)
  }
})

test("Tune actions, community and Reference keep cards only for purposeful overlays", () => {
  const files = [
    "components/library/TuneDetailActions.tsx",
    "components/library/TunePageReviewPanel.tsx",
    "components/library/PieceLoreSection.tsx",
    "components/library/PieceCommentsSection.tsx",
    "components/reference-media/ReferencePracticeWorkspace.tsx",
  ].map((file) => readFileSync(join(process.cwd(), file), "utf8"))

  for (const source of files) {
    assert.doesNotMatch(source, /rounded-(?:2xl|3xl|full)|shadow-sm|font-serif|uppercase/)
  }
})

test("tune detail keeps the dominant title full width on phone", () => {
  const detailPage = readFileSync(join(process.cwd(), "app/library/[id]/page.tsx"), "utf8")

  assert.match(detailPage, /flex min-w-0 flex-col gap-4 sm:flex-row/)
  assert.match(detailPage, /<TuneIdentity[\s\S]*?className="min-w-0 flex-1"/)
})

test("Known, Practice and tune route states share the editorial collection treatment", () => {
  const files = [
    "app/library/known/page.tsx",
    "app/library/practice/page.tsx",
    "components/repertoire/RepertoireTuneList.tsx",
    "app/library/[id]/reference-media/page.tsx",
    "app/library/[id]/loading.tsx",
  ].map((file) => readFileSync(join(process.cwd(), file), "utf8"))

  for (const source of files) {
    assert.doesNotMatch(source, /rounded-(?:2xl|3xl|sheet|pill|object)|shadow-(?:sm|material-rest|material-raised)|uppercase/)
  }
})

test("shared collection filters stay on the canvas instead of becoming cards", () => {
  const filterShell = readFileSync(join(process.cwd(), "components/filters/FilterShell.tsx"), "utf8")

  assert.doesNotMatch(filterShell, /rounded-object|shadow-material-rest|bg-surface-paper\/95|md:bg-surface-paper/)
  assert.match(filterShell, /border-y border-hairline/)
})

test("bulk tune import stays available on phone in an editorial sheet", () => {
  const actions = readFileSync(join(process.cwd(), "components/library/LibraryHeaderActions.tsx"), "utf8")
  const modal = readFileSync(join(process.cwd(), "components/library/BulkImportKnownTunesModal.tsx"), "utf8")

  assert.doesNotMatch(actions, /hidden md:block/)
  assert.doesNotMatch(modal, /rounded-3xl|rounded-2xl|font-serif|bg-card|bg-background\/70/)
  assert.match(modal, /rounded-sheet/)
  assert.match(modal, /border-y border-hairline/)
})

test("Lists, setlists and Compare use flat editorial regions outside purposeful overlays", () => {
  const primarySurfaces = [
    "app/learning-lists/page.tsx",
    "app/learning-lists/[id]/page.tsx",
    "app/public-lists/page.tsx",
    "app/public-lists/[id]/page.tsx",
    "app/setlists/page.tsx",
    "app/setlists/[id]/page.tsx",
    "app/compare/join/[token]/page.tsx",
    "components/lists/ListsPageViews.tsx",
    "components/lists/ListsSectionNav.tsx",
    "components/setlists/SetlistCollaboratorsSection.tsx",
    "components/setlists/SetlistCoverageSection.tsx",
    "components/compare/CompareMobile.tsx",
    "components/compare/CompareOutcomeExperience.tsx",
    "components/compare/CompareSuggestionsSection.tsx",
    "components/compare/CurrentCompareGroupSection.tsx",
  ].map((file) => readFileSync(join(process.cwd(), file), "utf8"))

  for (const source of primarySurfaces) {
    assert.doesNotMatch(source, /rounded-(?:2xl|3xl)|shadow-sm|font-serif/)
  }

  const lists = readFileSync(join(process.cwd(), "app/learning-lists/page.tsx"), "utf8")
  const setlist = readFileSync(join(process.cwd(), "app/setlists/[id]/page.tsx"), "utf8")
  const setlistMatrix = readFileSync(join(process.cwd(), "components/setlists/SetlistTuneMatrix.tsx"), "utf8")
  const compare = readFileSync(join(process.cwd(), "components/compare/CompareOutcomeExperience.tsx"), "utf8")
  const compareMobile = readFileSync(join(process.cwd(), "components/compare/CompareMobile.tsx"), "utf8")
  const publicListNotFound = readFileSync(join(process.cwd(), "app/public-lists/[id]/not-found.tsx"), "utf8")

  assert.match(lists, /border-t border-hairline/)
  assert.match(setlist, /aria-label="Setlist detail mode"/)
  assert.doesNotMatch(setlistMatrix, /rounded-2xl border border-border bg-background\/70 p-4 shadow-sm/)
  assert.doesNotMatch(setlistMatrix, /font-serif text-2xl/)
  assert.match(compare, /border-y border-hairline/)
  assert.equal(compareMobile.match(/md:text-6xl/g)?.length, 2)
  assert.doesNotMatch(publicListNotFound, /rounded-full/)
})

test("route loading states use flat ruled placeholders", () => {
  const skeleton = readFileSync(join(process.cwd(), "components/ui/Skeleton.tsx"), "utf8")

  assert.doesNotMatch(skeleton, /rounded-object|shadow-material-rest/)
  assert.match(skeleton, /border-y border-hairline/)
})

test("Social, Inbox and public profiles use editorial rows instead of nested cards", () => {
  const files = [
    "app/friends/page.tsx",
    "app/inbox/page.tsx",
    "components/friends/FriendsListSection.tsx",
    "components/friends/RecentFriendActivitySection.tsx",
    "components/inbox/DirectMessageThreadList.tsx",
    "components/inbox/InboxItemList.tsx",
    "components/profile/PublicProfileActions.tsx",
    "components/profile/PublicProfileBadgesSection.tsx",
    "components/profile/PublicProfileComposedTunesSection.tsx",
    "components/profile/PublicProfileOverview.tsx",
    "components/profile/PublicProfileRepertoireSection.tsx",
    "components/profile/PublicProfileHeader.tsx",
  ].map((file) => readFileSync(join(process.cwd(), file), "utf8"))

  for (const source of files) {
    assert.doesNotMatch(source, /rounded-(?:2xl|3xl|full)|shadow-(?:sm|md)|font-serif|uppercase/)
  }
})

test("badges, festivals, auth and internal queues share the editorial surface grammar", () => {
  const files = [
    "app/badges/page.tsx",
    "app/badges/[slug]/page.tsx",
    "components/badges/BadgeBrowser.tsx",
    "components/badges/BadgeRecipientsList.tsx",
    "app/events/[slug]/page.tsx",
    "components/events/FestivalSessions.tsx",
    "components/auth/LoginForm.tsx",
    "app/update-password/page.tsx",
    "app/dev/page.tsx",
    "app/dev/festivals/page.tsx",
    "app/moderator/page.tsx",
    "components/badges/CreateBadgeForm.tsx",
    "components/dev/DevSummaryCards.tsx",
    "components/dev/EmailUsersPanel.tsx",
    "components/dev/FeatureUsagePanel.tsx",
    "components/dev/FeedbackInbox.tsx",
    "components/dev/FestivalManager.tsx",
    "components/dev/MetricVisualiser.tsx",
    "components/dev/TestDigestPanel.tsx",
    "components/dev/UserActivityTable.tsx",
    "components/feedback/BetaFeedbackModal.tsx",
  ].map((file) => readFileSync(join(process.cwd(), file), "utf8"))

  for (const source of files) {
    assert.doesNotMatch(source, /rounded-(?:2xl|3xl|full)|shadow-(?:sm|md)|font-serif|uppercase/)
  }

  const badgeBrowser = readFileSync(
    join(process.cwd(), "components/badges/BadgeBrowser.tsx"),
    "utf8"
  )
  assert.match(badgeBrowser, /grid gap-4 md:grid-cols-2/)
})

test("developer metric columns can shrink inside a phone viewport", () => {
  const metricVisualiser = readFileSync(
    join(process.cwd(), "components/dev/MetricVisualiser.tsx"),
    "utf8"
  )

  assert.match(
    metricVisualiser,
    /className="min-w-0 rounded-object border border-border bg-background\/70 p-5"/
  )
  assert.match(metricVisualiser, /className="min-w-0 space-y-4"/)
})
