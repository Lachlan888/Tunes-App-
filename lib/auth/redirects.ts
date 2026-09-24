const INTERNAL_BASE_URL = "https://tunes-app.internal"

export function isSafeInternalPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return false
  }

  if (value.includes("\\") || /[\u0000-\u001f\u007f]/.test(value)) {
    return false
  }

  try {
    const decodedValue = decodeURIComponent(value)

    if (
      !decodedValue.startsWith("/") ||
      decodedValue.startsWith("//") ||
      decodedValue.includes("\\") ||
      /[\u0000-\u001f\u007f]/.test(decodedValue) ||
      /%(?:2f|5c|00|0a|0d)/i.test(decodedValue)
    ) {
      return false
    }

    return new URL(value, INTERNAL_BASE_URL).origin === INTERNAL_BASE_URL
  } catch {
    return false
  }
}

export function getSafeInternalPath(
  value: string | null | undefined,
  fallback = "/"
) {
  return isSafeInternalPath(value) ? value! : fallback
}

/** Authentication endpoints cannot themselves become a post-login destination. */
export function getAuthReturnPath(value: string | null | undefined, fallback = '/') {
  const safe = getSafeInternalPath(value, fallback)
  try {
    const pathname = decodeURIComponent(new URL(safe, INTERNAL_BASE_URL).pathname).replace(/\/+$/, '')
    if (/^\/(?:login|auth)(?:\/|$)/i.test(pathname)) return fallback
    return safe
  } catch { return fallback }
}
