/** Local diagnostics only: never log URLs, filters, headers, bodies or account IDs. */
export function measuredFetch(
  fetcher: typeof fetch,
  report: (sample: { kind: "data" | "auth" | "other"; status: number | null; durationMs: number }) => void,
): typeof fetch {
  return async (input, init) => {
    const started = performance.now()
    const pathname = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url).pathname
    const kind = pathname.startsWith("/rest/v1/") ? "data" : pathname.startsWith("/auth/v1/") ? "auth" : "other"
    let status: number | null = null
    try {
      const response = await fetcher(input, init)
      status = response.status
      return response
    } finally {
      report({ kind, status, durationMs: Math.round(performance.now() - started) })
    }
  }
}
