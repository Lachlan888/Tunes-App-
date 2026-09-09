export const LIST_PAGE_SIZE = 20
export const PUBLIC_LIST_PAGE_SIZE = 12

export function parseListPage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value
  const page = Number(raw)

  return Number.isSafeInteger(page) && page > 0 ? page : 1
}

export function paginateListItems<T>(items: T[], page: number, pageSize = LIST_PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const safePage = Math.min(Math.max(page, 1), totalPages)
  const start = (safePage - 1) * pageSize

  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    totalPages,
    totalCount: items.length,
    hasPreviousPage: safePage > 1,
    hasNextPage: safePage < totalPages,
  }
}

export function withListPage(href: string, page: number) {
  const [path, query = ""] = href.split("?")
  const params = new URLSearchParams(query)

  if (page <= 1) params.delete("page")
  else params.set("page", String(page))

  return params.size > 0 ? `${path}?${params.toString()}` : path
}
