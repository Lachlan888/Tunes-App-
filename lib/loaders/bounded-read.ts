type PageResult<T> = {
  data: T[] | null
  error: { message: string } | null
  count: number | null
}

export const READ_PAGE_SIZE = 500
export const READ_ROW_BUDGET = 10000

/** Complete a server-side aggregate in bounded pages, or fail without partial totals.
 * Callers must request an exact count and a stable unique order on every page.
 * Advance by actual rows so a lower project API row limit cannot skip records.
 */
export async function readBoundedRows<T>(
  page: (from: number, to: number) => PromiseLike<PageResult<T>>,
): Promise<T[]> {
  const rows: T[] = []
  let total: number | null = null
  for (let request = 0; request < 40; request++) {
    const result = await page(rows.length, rows.length + READ_PAGE_SIZE - 1)
    if (result.error) throw Object.assign(new Error(result.error.message), result.error)
    if (result.count === null || result.count > READ_ROW_BUDGET) {
      throw new Error("This collection is too large to load completely. Narrow the selection and try again.")
    }
    if (total !== null && result.count !== total) {
      throw new Error("This collection changed while loading. Refresh and try again.")
    }
    total = result.count
    const batch = result.data ?? []
    if (batch.length > READ_PAGE_SIZE || rows.length + batch.length > total) {
      throw new Error("This collection could not be loaded consistently. Refresh and try again.")
    }
    rows.push(...batch)
    if (rows.length === total) return rows
    if (batch.length === 0) break
  }
  throw new Error("This collection could not be loaded completely. Refresh and try again.")
}

/** Keep optional-schema callers' existing data/error handling intact. */
export async function readBoundedResult<T>(
  page: (from: number, to: number) => PromiseLike<PageResult<T>>,
) {
  try {
    return { data: await readBoundedRows(page), error: null }
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error("This collection could not be loaded.") }
  }
}
