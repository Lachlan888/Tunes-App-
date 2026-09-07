"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import SessionDock from "@/components/session-dock/SessionDock"
import {
  getActiveSessionDockRegistration,
  removeSessionDockRegistration,
  upsertSessionDockRegistration,
  type SessionDockModel,
  type SessionDockRegistration,
} from "@/components/session-dock/sessionDockModel"
import { joinClasses } from "@/components/ui/buttonStyles"

type SessionDockRegistry = {
  register: (ownerId: string, model: SessionDockModel) => void
  unregister: (ownerId: string) => void
}

type SessionDockLayerState = {
  isExpanded: boolean
}

const RegistryContext = createContext<SessionDockRegistry | null>(null)
const LayerContext = createContext<SessionDockLayerState>({ isExpanded: false })

export default function SessionDockProvider({
  children,
  enabled,
}: {
  children: ReactNode
  enabled: boolean
}) {
  const sequenceRef = useRef(0)
  const [registrations, setRegistrations] = useState<
    SessionDockRegistration[]
  >([])
  const [isExpanded, setIsExpanded] = useState(false)
  const activeRegistration = getActiveSessionDockRegistration(registrations)
  const activeModel = enabled ? activeRegistration?.model ?? null : null

  const register = useCallback((ownerId: string, model: SessionDockModel) => {
    sequenceRef.current += 1
    const registration = {
      ownerId,
      sequence: sequenceRef.current,
      model,
    }
    setRegistrations((current) =>
      upsertSessionDockRegistration(current, registration)
    )
  }, [])

  const unregister = useCallback((ownerId: string) => {
    setRegistrations((current) =>
      removeSessionDockRegistration(current, ownerId)
    )
    setIsExpanded(false)
  }, [])

  const registryValue = useMemo(
    () => ({ register, unregister }),
    [register, unregister]
  )
  const layerValue = useMemo(() => ({ isExpanded }), [isExpanded])

  useEffect(() => {
    const root = document.documentElement

    if (activeModel) root.dataset.sessionDock = "active"
    else delete root.dataset.sessionDock

    if (activeModel && isExpanded) root.dataset.sessionDockExpanded = "true"
    else delete root.dataset.sessionDockExpanded

    return () => {
      delete root.dataset.sessionDock
      delete root.dataset.sessionDockExpanded
    }
  }, [activeModel, isExpanded])

  return (
    <RegistryContext.Provider value={registryValue}>
      <LayerContext.Provider value={layerValue}>
        {children}
        {activeModel ? (
          <SessionDock
            model={activeModel}
            isExpanded={isExpanded}
            onExpandedChange={setIsExpanded}
          />
        ) : null}
      </LayerContext.Provider>
    </RegistryContext.Provider>
  )
}

export function useSessionDock(ownerId: string, model: SessionDockModel | null) {
  const registry = useContext(RegistryContext)

  useLayoutEffect(() => {
    if (!registry) return
    return () => registry.unregister(ownerId)
  }, [ownerId, registry])

  useLayoutEffect(() => {
    if (!registry) return
    if (!model) {
      registry.unregister(ownerId)
      return
    }
    registry.register(ownerId, model)
  }, [model, ownerId, registry])
}

export function SessionDockNavigation({ children }: { children: ReactNode }) {
  const { isExpanded } = useContext(LayerContext)

  return (
    <div
      inert={isExpanded}
      aria-hidden={isExpanded || undefined}
      className={joinClasses(
        "transition-opacity [transition-duration:var(--motion-quick)]",
        isExpanded && "pointer-events-none invisible opacity-0"
      )}
    >
      {children}
    </div>
  )
}

export function useSessionDockPosition(
  storageKey: string,
  itemCount: number,
  preferredPosition?: number
) {
  const [position, setPositionState] = useState(() =>
    preferredPosition === undefined
      ? 0
      : Math.min(Math.max(0, preferredPosition), Math.max(0, itemCount - 1))
  )

  useEffect(() => {
    if (preferredPosition !== undefined) {
      window.sessionStorage.setItem(storageKey, String(preferredPosition))
      return
    }

    const stored = Number(window.sessionStorage.getItem(storageKey))
    if (!Number.isInteger(stored) || stored < 0) return

    // Hydrate transient task position after mount to keep server markup stable.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPositionState(Math.min(stored, Math.max(0, itemCount - 1)))
  }, [itemCount, preferredPosition, storageKey])

  const setPosition = useCallback(
    (nextPosition: number | ((current: number) => number)) => {
      setPositionState((current) => {
        const requested =
          typeof nextPosition === "function"
            ? nextPosition(current)
            : nextPosition
        const next = Math.min(
          Math.max(0, requested),
          Math.max(0, itemCount - 1)
        )
        window.sessionStorage.setItem(storageKey, String(next))
        return next
      })
    },
    [itemCount, storageKey]
  )

  useEffect(() => {
    if (position < itemCount || position === 0) return

    // Clamp when a completed item leaves a queue after navigation refresh.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPosition(Math.max(0, itemCount - 1))
  }, [itemCount, position, setPosition])

  return [Math.min(position, Math.max(0, itemCount - 1)), setPosition] as const
}
