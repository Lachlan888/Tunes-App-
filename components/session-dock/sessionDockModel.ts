import type { IconName } from "@/components/ui/Icon"

export const SESSION_DOCK_CONTEXTS = [
  "tune-detail",
  "focused-practice",
  "reference-media",
  "catalogue-selection",
  "setlist-performance",
] as const

export const SESSION_DOCK_FULL_DRAG_DISTANCE = 36

export type SessionDockContext = (typeof SESSION_DOCK_CONTEXTS)[number]
export type SessionDockActionTone =
  | "primary"
  | "secondary"
  | "practice"
  | "rough"
  | "shaky"
  | "solid"

type SessionDockActionBase = {
  id: string
  label: string
  ariaLabel?: string
  icon?: IconName
  tone?: SessionDockActionTone
  disabled?: boolean
  pressed?: boolean
  closeOnInvoke?: boolean
}

export type SessionDockLinkAction = SessionDockActionBase & {
  href: string
  onInvoke?: never
}

export type SessionDockButtonAction = SessionDockActionBase & {
  href?: never
  onInvoke: () => void
}

export type SessionDockAction =
  | SessionDockLinkAction
  | SessionDockButtonAction

export type SessionDockProgress = {
  label: string
  current?: number
  total?: number
  value?: number
  max?: number
}

export type SessionDockStatus = {
  label: string
  tone?: "neutral" | "known" | "practice" | "due" | "overdue"
}

export type SessionDockTool = "metronome"

export type SessionDockModel = {
  /** Stable within a task. Used for registration and transient state ownership. */
  id: string
  context: SessionDockContext
  identity: {
    eyebrow: string
    title: string
    detail?: string
  }
  primaryAction: SessionDockAction | null
  secondaryActions: SessionDockAction[]
  progress?: SessionDockProgress
  status?: SessionDockStatus
  collapsedContent: {
    /** Defaults to the primary action. Contexts may expose a small action cluster. */
    actionIds?: string[]
    showProgress?: boolean
  }
  expandedContent: {
    title: string
    description?: string
    actionIds?: string[]
    tools?: SessionDockTool[]
  }
  /** Documents the safe boundary used by the route's real state owner. */
  persistence: {
    shareable: "url" | "none"
    transient: "session" | "none"
    key?: string
  }
  announcement?: string
}

export type SessionDockRegistration = {
  ownerId: string
  sequence: number
  model: SessionDockModel
}

export function getSessionDockActions(model: SessionDockModel) {
  return [model.primaryAction, ...model.secondaryActions].filter(
    (action): action is SessionDockAction => Boolean(action)
  )
}

export function getSessionDockExpansionMode(startY: number, endY: number) {
  return startY - endY >= SESSION_DOCK_FULL_DRAG_DISTANCE
    ? "full-screen"
    : "sheet"
}

export function selectSessionDockActions(
  model: SessionDockModel,
  actionIds?: string[]
) {
  const actions = getSessionDockActions(model)
  if (!actionIds) return model.primaryAction ? [model.primaryAction] : []

  const byId = new Map(actions.map((action) => [action.id, action]))
  return actionIds.flatMap((id) => {
    const action = byId.get(id)
    return action ? [action] : []
  })
}

export function upsertSessionDockRegistration(
  registrations: SessionDockRegistration[],
  registration: SessionDockRegistration
) {
  return [
    ...registrations.filter(
      (candidate) => candidate.ownerId !== registration.ownerId
    ),
    registration,
  ]
}

export function removeSessionDockRegistration(
  registrations: SessionDockRegistration[],
  ownerId: string
) {
  return registrations.filter((candidate) => candidate.ownerId !== ownerId)
}

export function getActiveSessionDockRegistration(
  registrations: SessionDockRegistration[]
) {
  return registrations.reduce<SessionDockRegistration | null>(
    (active, candidate) =>
      !active || candidate.sequence > active.sequence ? candidate : active,
    null
  )
}
