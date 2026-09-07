"use client"

import Link from "next/link"
import { useRef, useState } from "react"
import {
  getSessionDockExpansionMode,
  selectSessionDockActions,
  type SessionDockAction,
  type SessionDockActionTone,
  type SessionDockModel,
} from "@/components/session-dock/sessionDockModel"
import Icon from "@/components/ui/Icon"
import ResponsiveModal from "@/components/ui/ResponsiveModal"
import { joinClasses } from "@/components/ui/buttonStyles"
import { OPEN_METRONOME_EVENT } from "@/lib/ui-events"

const actionToneClasses: Record<SessionDockActionTone, string> = {
  primary:
    "border-action-primary bg-action-primary text-action-primary-foreground hover:bg-action-primary-hover",
  secondary:
    "border-hairline bg-surface-paper text-text-primary hover:bg-surface-note",
  practice:
    "border-state-practice bg-state-practice text-state-practice-foreground hover:bg-state-practice/90",
  rough:
    "border-state-overdue bg-state-overdue text-state-overdue-foreground hover:bg-state-overdue/90",
  shaky:
    "border-state-due bg-state-due text-state-due-foreground hover:bg-state-due/88",
  solid:
    "border-state-known bg-state-known text-state-known-foreground hover:bg-state-known/90",
}

function ActionControl({
  action,
  compact = false,
  onBeforeInvoke,
}: {
  action: SessionDockAction
  compact?: boolean
  onBeforeInvoke?: () => void
}) {
  const className = joinClasses(
    "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-control border px-3 py-2 text-sm font-semibold shadow-material-rest transition-[background-color,border-color,color,transform] [transition-duration:var(--motion-standard)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-55",
    actionToneClasses[action.tone ?? "secondary"],
    compact && "min-w-0 flex-1 px-2 text-xs sm:flex-none sm:px-3 sm:text-sm"
  )

  const content = (
    <>
      {action.icon ? <Icon name={action.icon} size={16} /> : null}
      <span>{action.label}</span>
    </>
  )

  if ("href" in action && action.href) {
    const isExternal = /^https?:\/\//.test(action.href)
    const sharedProps = {
      "aria-label": action.ariaLabel,
      "aria-disabled": action.disabled || undefined,
      className: joinClasses(className, action.disabled && "pointer-events-none"),
      onClick: () => {
        if (action.closeOnInvoke !== false) onBeforeInvoke?.()
      },
    }

    return isExternal ? (
      <a href={action.href} target="_blank" rel="noreferrer" {...sharedProps}>
        {content}
      </a>
    ) : (
      <Link href={action.href} {...sharedProps}>
        {content}
      </Link>
    )
  }

  return (
    <button
      type="button"
      disabled={action.disabled}
      aria-label={action.ariaLabel}
      aria-pressed={action.pressed}
      className={className}
      onClick={() => {
        if (action.closeOnInvoke !== false) onBeforeInvoke?.()
        if ("onInvoke" in action) action.onInvoke?.()
      }}
    >
      {content}
    </button>
  )
}

function ProgressSummary({ model }: { model: SessionDockModel }) {
  if (!model.progress) return null

  const { current, total, value, max, label } = model.progress
  const hasFraction = current !== undefined && total !== undefined
  const hasBar = value !== undefined && max !== undefined && max > 0

  return (
    <div className="min-w-0">
      <p className="truncate text-xs font-semibold text-text-muted">
        {label}
        {hasFraction ? ` · ${current}/${total}` : ""}
      </p>
      {hasBar ? (
        <div
          className="mt-1 h-1.5 overflow-hidden rounded-pill bg-surface-note"
          role="progressbar"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={Math.min(value, max)}
        >
          <span
            className="block h-full rounded-pill bg-state-practice"
            style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
          />
        </div>
      ) : null}
    </div>
  )
}

export default function SessionDock({
  model,
  isExpanded,
  onExpandedChange,
}: {
  model: SessionDockModel
  isExpanded: boolean
  onExpandedChange: (isExpanded: boolean) => void
}) {
  const [mobileMode, setMobileMode] = useState<"sheet" | "full-screen">(
    "sheet"
  )
  const dragStartYRef = useRef<number | null>(null)
  const suppressClickRef = useRef(false)
  const collapsedActions = selectSessionDockActions(
    model,
    model.collapsedContent.actionIds
  )
  const expandedActions = selectSessionDockActions(
    model,
    model.expandedContent.actionIds ??
      [
        model.primaryAction?.id,
        ...model.secondaryActions.map((action) => action.id),
      ].filter((id): id is string => Boolean(id))
  )

  function open(mode: "sheet" | "full-screen") {
    setMobileMode(mode)
    onExpandedChange(true)
  }

  function close() {
    onExpandedChange(false)
  }

  return (
    <>
      <aside
        data-session-dock-context={model.context}
        inert={isExpanded}
        aria-hidden={isExpanded || undefined}
        className={joinClasses(
          "session-dock floating-material fixed inset-x-2 z-[320] rounded-sheet border border-hairline p-2 shadow-material-floating transition-[opacity,transform] [transition-duration:var(--motion-standard)] [transition-timing-function:var(--ease-folk)] md:inset-x-auto md:bottom-4 md:left-[calc(4.75rem+1rem)] md:right-4 md:mx-auto md:max-w-4xl lg:left-[calc(15rem+1rem)]",
          isExpanded && "pointer-events-none invisible translate-y-2 opacity-0"
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            aria-label={`Expand ${model.identity.title} session tools`}
            aria-haspopup="dialog"
            aria-expanded={isExpanded}
            className="group flex min-h-11 min-w-11 shrink-0 touch-none flex-col items-center justify-center rounded-control text-text-muted hover:bg-surface-note hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
            onPointerDown={(event) => {
              dragStartYRef.current = event.clientY
              suppressClickRef.current = false
              event.currentTarget.setPointerCapture(event.pointerId)
            }}
            onPointerUp={(event) => {
              const startY = dragStartYRef.current
              dragStartYRef.current = null
              if (
                startY === null ||
                getSessionDockExpansionMode(startY, event.clientY) !==
                  "full-screen"
              ) {
                return
              }

              suppressClickRef.current = true
              open("full-screen")
            }}
            onClick={() => {
              if (suppressClickRef.current) {
                suppressClickRef.current = false
                return
              }
              open("sheet")
            }}
          >
            <span
              aria-hidden="true"
              className="h-1 w-6 rounded-pill bg-current transition-transform group-hover:-translate-y-0.5"
            />
            <span className="sr-only">Tap for sheet or drag up for full screen</span>
          </button>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-text-muted">
              {model.identity.eyebrow}
            </p>
            <p className="truncate text-sm font-semibold text-text-primary sm:text-base">
              {model.identity.title}
            </p>
            {model.collapsedContent.showProgress ? (
              <ProgressSummary model={model} />
            ) : model.identity.detail ? (
              <p className="truncate text-xs text-text-muted">
                {model.identity.detail}
              </p>
            ) : null}
          </div>

          {collapsedActions.length > 0 ? (
            <div className="flex min-w-0 shrink-0 items-center gap-1.5">
              {collapsedActions.map((action) => (
                <ActionControl key={action.id} action={action} compact />
              ))}
            </div>
          ) : null}
        </div>

        <p className="sr-only" role="status" aria-live="polite">
          {model.announcement ??
            [model.status?.label, model.progress?.label]
              .filter(Boolean)
              .join(". ")}
        </p>
      </aside>

      <ResponsiveModal
        isOpen={isExpanded}
        onClose={close}
        eyebrow={model.identity.eyebrow}
        title={model.expandedContent.title}
        description={model.expandedContent.description}
        mobileMode={mobileMode}
        desktopMaxWidth="md:max-w-2xl"
        panelClassName="session-dock-sheet"
      >
        <div className="grid gap-5">
          <div className="rounded-object border border-hairline bg-surface-note p-4">
            <p className="font-serif text-xl font-semibold text-text-primary">
              {model.identity.title}
            </p>
            {model.identity.detail ? (
              <p className="mt-1 text-sm text-text-muted">
                {model.identity.detail}
              </p>
            ) : null}
            {model.status ? (
              <p className="mt-2 text-sm font-semibold text-text-primary">
                {model.status.label}
              </p>
            ) : null}
            <div className="mt-3">
              <ProgressSummary model={model} />
            </div>
          </div>

          {expandedActions.length > 0 ? (
            <div
              className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap"
              aria-label={`${model.identity.title} actions`}
            >
              {expandedActions.map((action) => (
                <ActionControl
                  key={action.id}
                  action={action}
                  onBeforeInvoke={close}
                />
              ))}
            </div>
          ) : null}

          {model.expandedContent.tools?.includes("metronome") ? (
            <section className="border-t border-hairline pt-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
                Session tool
              </p>
              <button
                type="button"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control border border-hairline bg-surface-paper px-3 py-2 text-sm font-semibold text-text-primary shadow-material-rest hover:bg-surface-note focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                onClick={() => {
                  close()
                  window.setTimeout(
                    () => window.dispatchEvent(new Event(OPEN_METRONOME_EVENT)),
                    0
                  )
                }}
              >
                <Icon name="metronome" />
                <span>Open metronome</span>
              </button>
            </section>
          ) : null}
        </div>
      </ResponsiveModal>
    </>
  )
}
