/** Validate exact overview routes; query/hash transport does not restore scroll. */
function safeOverviewReturn(value: string | string[] | undefined, allowDiscovery: boolean): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[\\\x00-\x20]/.test(value)) return "/learning-lists"
  try {
    const url = new URL(value, "https://tunes.invalid")
    if (url.origin !== "https://tunes.invalid" || (url.pathname !== "/learning-lists" && !(allowDiscovery && url.pathname === "/public-lists"))) return "/learning-lists"
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return "/learning-lists"
  }
}

export function safeListReturn(value: string | string[] | undefined): string {
  return safeOverviewReturn(value, false)
}

export function safePublicListReturn(value: string | string[] | undefined): string {
  return safeOverviewReturn(value, true)
}

export function learningListHref(id: number, returnTo: string | string[] | undefined, mode = "reader") {
  const params = new URLSearchParams()
  params.set("return_to", safeListReturn(returnTo))
  if (mode === "manage") params.set("mode", "manage")
  return `/learning-lists/${id}?${params}`
}

export function publicListHref(id: number, returnTo: string | string[] | undefined) {
  const params = new URLSearchParams({ return_to: safePublicListReturn(returnTo) })
  return `/public-lists/${id}?${params}`
}
