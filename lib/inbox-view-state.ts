export type InboxTab = "activity" | "messages"

export function parseInboxTab(value?: string): InboxTab {
  return value === "messages" ? "messages" : "activity"
}

export function parseInboxPage(value?: string) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, 50) : 1
}

export function paginateItems<T>(items: T[], page: number, pageSize = 20) {
  const safePage = Math.max(1, Math.min(page, 50))
  const start = (safePage - 1) * pageSize
  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    hasPrevious: safePage > 1,
    hasNext: start + pageSize < items.length,
  }
}
