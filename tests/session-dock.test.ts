import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import {
  SESSION_DOCK_CONTEXTS,
  getActiveSessionDockRegistration,
  getSessionDockExpansionMode,
  removeSessionDockRegistration,
  selectSessionDockActions,
  upsertSessionDockRegistration,
  type SessionDockContext,
  type SessionDockModel,
} from "../components/session-dock/sessionDockModel.ts"

function makeModel(
  context: SessionDockContext,
  title: string = context
): SessionDockModel {
  return {
    id: `${context}:test`,
    context,
    identity: { eyebrow: "Session", title },
    primaryAction: {
      id: "primary",
      label: "Primary",
      onInvoke: () => undefined,
    },
    secondaryActions: [
      {
        id: "secondary",
        label: "Secondary",
        onInvoke: () => undefined,
      },
    ],
    collapsedContent: { actionIds: ["primary"] },
    expandedContent: {
      title: `${title} tools`,
      actionIds: ["primary", "secondary"],
    },
    persistence: { shareable: "none", transient: "none" },
  }
}

test("one typed API supports every planned Session Dock context", () => {
  assert.deepEqual(SESSION_DOCK_CONTEXTS, [
    "tune-detail",
    "focused-practice",
    "reference-media",
    "catalogue-selection",
    "setlist-performance",
  ])

  for (const context of SESSION_DOCK_CONTEXTS) {
    const model = makeModel(context)
    assert.equal(model.context, context)
    assert.deepEqual(
      selectSessionDockActions(model, model.expandedContent.actionIds).map(
        (action) => action.id
      ),
      ["primary", "secondary"]
    )
  }
})

test("the latest mounted context wins and the previous context is restored", () => {
  const tune = {
    ownerId: "tune-page",
    sequence: 1,
    model: makeModel("tune-detail", "The Kesh"),
  }
  const media = {
    ownerId: "media-workspace",
    sequence: 2,
    model: makeModel("reference-media", "Session recording"),
  }

  let registrations = upsertSessionDockRegistration([], tune)
  registrations = upsertSessionDockRegistration(registrations, media)
  assert.equal(
    getActiveSessionDockRegistration(registrations)?.model.context,
    "reference-media"
  )

  registrations = removeSessionDockRegistration(
    registrations,
    "media-workspace"
  )
  assert.equal(
    getActiveSessionDockRegistration(registrations)?.model.context,
    "tune-detail"
  )
})

test("the explicit handle distinguishes a tap from an upward full-screen drag", () => {
  assert.equal(getSessionDockExpansionMode(700, 690), "sheet")
  assert.equal(getSessionDockExpansionMode(700, 664), "full-screen")
  assert.equal(getSessionDockExpansionMode(700, 620), "full-screen")
})

test("expansion, focus restoration and single-layer suppression are wired", () => {
  const dock = readFileSync(
    new URL("../components/session-dock/SessionDock.tsx", import.meta.url),
    "utf8"
  )
  const provider = readFileSync(
    new URL(
      "../components/session-dock/SessionDockProvider.tsx",
      import.meta.url
    ),
    "utf8"
  )
  const modal = readFileSync(
    new URL("../components/ui/ResponsiveModal.tsx", import.meta.url),
    "utf8"
  )

  assert.match(dock, /aria-haspopup="dialog"/)
  assert.match(dock, /getSessionDockExpansionMode\(startY, event\.clientY\)/)
  assert.match(dock, /open\("full-screen"\)/)
  assert.match(dock, /mobileMode=\{mobileMode\}/)
  assert.match(provider, /inert=\{isExpanded\}/)
  assert.match(provider, /pointer-events-none invisible opacity-0/)
  assert.match(
    provider,
    /if \(!model\) \{[\s\S]*registry\.unregister\(ownerId\)/
  )
  assert.match(modal, /previouslyFocused\?\.focus\(\)/)
  assert.match(modal, /role="dialog"/)
  assert.match(modal, /aria-modal="true"/)
})

test("Session Dock and Navigation Dock reserve one combined safe area", () => {
  const css = readFileSync(
    new URL("../app/globals.css", import.meta.url),
    "utf8"
  )
  const dock = readFileSync(
    new URL("../components/session-dock/SessionDock.tsx", import.meta.url),
    "utf8"
  )

  assert.match(css, /--navigation-dock-space:/)
  assert.match(css, /--session-dock-space:/)
  assert.match(
    css,
    /padding-bottom: calc\(var\(--navigation-dock-space\) \+ var\(--session-dock-space\)\)/
  )
  assert.match(
    css,
    /bottom: calc\(var\(--navigation-dock-space\) \+ 0\.25rem\)/
  )
  assert.match(dock, /data-session-dock-context=\{model\.context\}/)
})

test("route integrations preserve only safe contextual state", () => {
  const practice = readFileSync(
    new URL(
      "../components/practice/ReviewQueueSection.tsx",
      import.meta.url
    ),
    "utf8"
  )
  const media = readFileSync(
    new URL("../components/library/YouTubeLoopPlayer.tsx", import.meta.url),
    "utf8"
  )
  const setlist = readFileSync(
    new URL(
      "../components/session-dock/SetlistSessionDock.tsx",
      import.meta.url
    ),
    "utf8"
  )

  assert.match(practice, /session\.v1\.practice/)
  assert.match(media, /session\.v1\.reference/)
  assert.match(media, /currentTime/)
  assert.match(media, /loopEnabled/)
  assert.match(media, /activeLoopId/)
  assert.match(setlist, /session\.v1\.setlist/)
  assert.match(setlist, /searchParams\.set\("performance"/)
})
