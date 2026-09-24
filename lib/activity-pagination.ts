export type ActivityCursor = { createdAt: string; id: number }
export const ACTIVITY_PAGE_SIZE = 20
export const ACTIVITY_WINDOW_SIZE = 80

export function activityCursor(item: { created_at: string; id: number }) {
  return `${item.created_at}~${item.id}`
}

export function parseActivityCursor(value: string | null): ActivityCursor | null {
  if (!value) return null
  const [createdAt, rawId, extra] = value.split("~")
  const id = Number(rawId)
  if (extra !== undefined || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?(Z|[+-]\d{2}:\d{2})$/.test(createdAt) || !Number.isFinite(Date.parse(createdAt)) || !Number.isSafeInteger(id) || id <= 0) return null
  return { createdAt, id }
}

export function mergeActivityPage<T extends { id: number; created_at: string }>(existing: T[], incoming: T[]) {
  return Array.from(new Map([...existing, ...incoming].map(item => [item.id, item])).values()).sort((a, b) => b.created_at.localeCompare(a.created_at) || b.id - a.id)
}
