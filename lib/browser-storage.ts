/** Storage is optional. Blocked/quota-full storage must never break the active task. */
export type BrowserStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">

export function optionalStorage(getStorage: () => BrowserStorage, prefix = ""): BrowserStorage {
  const fallback = new Map<string, string | null>()
  return {
    getItem(key) { if (fallback.has(key)) return fallback.get(key)!; try { return getStorage().getItem(prefix + key) } catch { return null } },
    setItem(key, value) { try { getStorage().setItem(prefix + key, value); fallback.delete(key) } catch { fallback.set(key, value) } },
    removeItem(key) { try { getStorage().removeItem(prefix + key); fallback.delete(key) } catch { fallback.set(key, null) } },
  }
}

export const preferenceStorage = optionalStorage(() => window.localStorage)
export function privateSessionStorage(userId: string | null): BrowserStorage {
  // Anonymous previews have no access to any signed-in account's transient state.
  return optionalStorage(() => window.sessionStorage, `tunes.private.v1.${encodeURIComponent(userId ?? "anonymous")}.`)
}

export function purgeTunesSessionStorage() {
  try {
    for (let index = window.sessionStorage.length - 1; index >= 0; index--) {
      const key = window.sessionStorage.key(index)
      if (key?.startsWith("tunes.")) window.sessionStorage.removeItem(key)
    }
  } catch { /* No accessible session storage to purge. */ }
}
