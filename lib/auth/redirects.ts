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
      decodedValue.includes("\\")
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
