"use client"

import { useCallback, useMemo, useRef } from "react"
import { useSessionDock } from "@/components/session-dock/SessionDockProvider"
import type { SessionDockModel } from "@/components/session-dock/sessionDockModel"

type TuneDetailSessionDockProps = {
  pieceId: number
  title: string
  detail: string
  redirectTo: string
  referenceHref: string | null
  pageOptionsTriggerId: string
  isInPractice: boolean
  practiceStage: number | null
  isKnown: boolean
  startPractice: (formData: FormData) => Promise<void>
}

export default function TuneDetailSessionDock({
  pieceId,
  title,
  detail,
  redirectTo,
  referenceHref,
  pageOptionsTriggerId,
  isInPractice,
  practiceStage,
  isKnown,
  startPractice,
}: TuneDetailSessionDockProps) {
  const startFormRef = useRef<HTMLFormElement>(null)
  const start = useCallback(() => startFormRef.current?.requestSubmit(), [])
  const openPageOptions = useCallback(() => {
    window.setTimeout(() => {
      document.getElementById(pageOptionsTriggerId)?.click()
    }, 0)
  }, [pageOptionsTriggerId])

  const model = useMemo<SessionDockModel>(() => {
    const primaryAction = isInPractice
      ? {
          id: "practice",
          label: "Already in practice",
          ariaLabel: `Open Practice for ${title}${practiceStage ? `, currently Stage ${practiceStage}` : ""}`,
          href: "/review#review-queue",
          tone: "practice" as const,
        }
      : {
          id: "practice",
          label: "Start Practice",
          ariaLabel: `Start Practice for ${title}`,
          onInvoke: start,
          tone: "practice" as const,
        }

    const secondaryActions: SessionDockModel["secondaryActions"] = []
    if (referenceHref) {
      secondaryActions.push({
        id: "reference",
        label: "Reference",
        href: referenceHref,
        tone: "secondary",
      })
    }
    secondaryActions.push({
      id: "overflow",
      label: "More",
      ariaLabel: `Open Page Options for ${title}`,
      onInvoke: openPageOptions,
      tone: "secondary",
    })

    const stateLabel = isInPractice
      ? practiceStage
        ? `Already in practice · Stage ${practiceStage}`
        : "Already in practice"
      : isKnown
        ? "Known"
        : "Not in practice"

    return {
      id: `tune-detail:${pieceId}`,
      context: "tune-detail",
      identity: { eyebrow: "Tune", title, detail },
      primaryAction,
      secondaryActions,
      status: {
        label: stateLabel,
        tone: isInPractice ? "practice" : isKnown ? "known" : "neutral",
      },
      collapsedContent: { actionIds: ["practice"] },
      expandedContent: {
        title: `${title} tools`,
        description:
          "Practice, reference and infrequent tune actions stay attached to this tune.",
        actionIds: ["practice", "reference", "overflow"],
      },
      persistence: {
        shareable: "url",
        transient: "none",
      },
      announcement: stateLabel,
    }
  }, [
    detail,
    isInPractice,
    isKnown,
    openPageOptions,
    pieceId,
    practiceStage,
    referenceHref,
    start,
    title,
  ])

  useSessionDock(`tune-detail:${pieceId}`, model)

  return isInPractice ? null : (
    <form
      ref={startFormRef}
      action={startPractice}
      className="sr-only"
      aria-hidden="true"
    >
      <input type="hidden" name="piece_id" value={pieceId} />
      <input type="hidden" name="redirect_to" value={redirectTo} />
      <button type="submit" tabIndex={-1}>
        Start Practice
      </button>
    </form>
  )
}
