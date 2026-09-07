export async function withServerTiming<T>(
  label: string,
  task: () => Promise<T>
): Promise<T> {
  const startedAt = performance.now()

  try {
    return await task()
  } finally {
    if (process.env.NODE_ENV === "development") {
      const duration = performance.now() - startedAt
      console.info(`[server-timing] ${label}: ${duration.toFixed(1)}ms`)
    }
  }
}
