"use client"

import { useOnlineStatus } from "@/hooks/useOnlineStatus"

export default function ConnectionStatus() {
  const online = useOnlineStatus()
  return <div role="status" aria-live="polite" aria-atomic="true">
    {!online && <p className="mx-4 my-2 rounded-control border border-state-due bg-surface-paper px-4 py-3 text-sm text-text-primary">Offline. Keep this page open to retain your loaded tunes and unsaved notes. Changes are not synced; reconnect before saving. External recordings need a connection.</p>}
  </div>
}
