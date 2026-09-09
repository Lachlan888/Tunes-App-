"use client"

import { useMemo, useState } from "react"
import { useSessionDock } from "@/components/session-dock/SessionDockProvider"
import {
  SESSION_DOCK_CONTEXTS,
  type SessionDockContext,
  type SessionDockModel,
} from "@/components/session-dock/sessionDockModel"
import { joinClasses } from "@/components/ui/buttonStyles"

const contextLabels: Record<SessionDockContext, string> = {
  "tune-detail": "Tune detail",
  "focused-practice": "Focused practice",
  "reference-media": "Reference media",
  "catalogue-selection": "Catalogue selection",
  "list-selection": "List selection",
  "setlist-performance": "Setlist performance",
}

const noOp = () => undefined

function createShowcaseModel(context: SessionDockContext): SessionDockModel {
  if (context === "focused-practice") {
    return {
      id: "showcase:focused-practice",
      context,
      identity: {
        eyebrow: "Due today",
        title: "The Kesh",
        detail: "Stage 3",
      },
      primaryAction: {
        id: "next",
        label: "Next",
        onInvoke: noOp,
        tone: "practice",
      },
      secondaryActions: [
        { id: "rough", label: "Rough", onInvoke: noOp, tone: "rough" },
        { id: "shaky", label: "Shaky", onInvoke: noOp, tone: "shaky" },
        { id: "solid", label: "Solid", onInvoke: noOp, tone: "solid" },
      ],
      progress: {
        label: "Queue progress",
        current: 4,
        total: 12,
        value: 4,
        max: 12,
      },
      status: { label: "Stage 3", tone: "practice" },
      collapsedContent: {
        actionIds: ["rough", "shaky", "solid"],
        showProgress: true,
      },
      expandedContent: {
        title: "The Kesh practice tools",
        description: "Rate recall quality and continue through the queue.",
        actionIds: ["rough", "shaky", "solid", "next"],
      },
      persistence: { shareable: "url", transient: "session" },
    }
  }

  if (context === "reference-media") {
    return {
      id: "showcase:reference-media",
      context,
      identity: {
        eyebrow: "Reference",
        title: "Live session recording",
        detail: "B part turnaround",
      },
      primaryAction: {
        id: "playback",
        label: "Play",
        onInvoke: noOp,
        tone: "practice",
      },
      secondaryActions: [
        { id: "loop", label: "Loop on", onInvoke: noOp, tone: "practice" },
        { id: "speed", label: "0.75×", onInvoke: noOp },
        { id: "section", label: "Sections", onInvoke: noOp },
      ],
      progress: { label: "01:14 of 03:42", value: 74, max: 222 },
      status: { label: "Loop on · 0.75×", tone: "practice" },
      collapsedContent: {
        actionIds: ["playback", "loop"],
        showProgress: true,
      },
      expandedContent: {
        title: "Live session recording controls",
        description: "Playback, loop, speed and saved sections.",
        actionIds: ["playback", "loop", "speed", "section"],
      },
      persistence: { shareable: "url", transient: "session" },
    }
  }

  if (context === "catalogue-selection") {
    return {
      id: "showcase:catalogue-selection",
      context,
      identity: {
        eyebrow: "Tunes",
        title: "3 tunes selected",
        detail: "Catalogue selection",
      },
      primaryAction: {
        id: "add",
        label: "Add to List",
        onInvoke: noOp,
        tone: "primary",
      },
      secondaryActions: [
        { id: "clear", label: "Clear", onInvoke: noOp, tone: "secondary" },
      ],
      status: { label: "3 selected", tone: "neutral" },
      collapsedContent: { actionIds: ["add"] },
      expandedContent: {
        title: "Selected tune tools",
        description: "Add this private selection to a list or clear it.",
        actionIds: ["add", "clear"],
      },
      persistence: { shareable: "none", transient: "session" },
    }
  }

  if (context === "setlist-performance") {
    return {
      id: "showcase:setlist-performance",
      context,
      identity: {
        eyebrow: "Thursday session",
        title: "Out on the Ocean",
        detail: "Key G",
      },
      primaryAction: {
        id: "next",
        label: "Next",
        onInvoke: noOp,
        tone: "practice",
      },
      secondaryActions: [
        { id: "previous", label: "Previous", onInvoke: noOp },
      ],
      progress: {
        label: "Setlist position",
        current: 5,
        total: 9,
        value: 5,
        max: 9,
      },
      status: { label: "Performance key G", tone: "neutral" },
      collapsedContent: {
        actionIds: ["previous", "next"],
        showProgress: true,
      },
      expandedContent: {
        title: "Out on the Ocean performance tools",
        description: "Previous and next actions follow the running order.",
        actionIds: ["previous", "next"],
      },
      persistence: { shareable: "url", transient: "session" },
    }
  }

  return {
    id: "showcase:tune-detail",
    context,
    identity: {
      eyebrow: "Tune",
      title: "The Maid Behind the Bar",
      detail: "Reel · D major",
    },
    primaryAction: {
      id: "practice",
      label: "Start Practice",
      onInvoke: noOp,
      tone: "practice",
    },
    secondaryActions: [
      { id: "reference", label: "Reference", onInvoke: noOp },
      { id: "overflow", label: "More", onInvoke: noOp },
    ],
    status: { label: "Not in practice", tone: "neutral" },
    collapsedContent: { actionIds: ["practice"] },
    expandedContent: {
      title: "The Maid Behind the Bar tools",
      description: "Practice, reference and infrequent tune actions.",
      actionIds: ["practice", "reference", "overflow"],
    },
    persistence: { shareable: "url", transient: "none" },
  }
}

export default function SessionDockShowcase() {
  const [context, setContext] =
    useState<SessionDockContext>("tune-detail")
  const model = useMemo(() => createShowcaseModel(context), [context])

  useSessionDock("design-system-session-dock", model)

  return (
    <section className="mb-12">
      <h2 className="font-serif text-2xl font-semibold text-text-primary">
        Adaptive Session Dock
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-text-muted">
        Switch task contexts, then use the fixed dock below. Tap its handle for
        a medium sheet or drag the handle upward for the full workspace.
      </p>
      <div className="mt-4 flex flex-wrap gap-2" aria-label="Session Dock preview context">
        {SESSION_DOCK_CONTEXTS.map((candidate) => (
          <button
            key={candidate}
            type="button"
            aria-pressed={context === candidate}
            className={joinClasses(
              "min-h-11 rounded-control border px-3 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
              context === candidate
                ? "border-action-primary bg-action-primary text-action-primary-foreground"
                : "border-hairline bg-surface-paper text-text-primary hover:bg-surface-note"
            )}
            onClick={() => setContext(candidate)}
          >
            {contextLabels[candidate]}
          </button>
        ))}
      </div>
    </section>
  )
}
