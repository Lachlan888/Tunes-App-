"use client"

import { useSyncExternalStore } from "react"

function subscribe(onChange: () => void) {
  window.addEventListener("online", onChange)
  window.addEventListener("offline", onChange)
  return () => { window.removeEventListener("online", onChange); window.removeEventListener("offline", onChange) }
}
const snapshot = () => navigator.onLine
const serverSnapshot = () => true

export function useOnlineStatus() { return useSyncExternalStore(subscribe, snapshot, serverSnapshot) }
