export const TUNE_DETAIL_VIEWS = ["practice", "reference", "about"] as const

export type TuneDetailView = (typeof TUNE_DETAIL_VIEWS)[number]
export type TuneDetailSearchParam = string | string[] | undefined

export function resolveTuneDetailView(
  value: TuneDetailSearchParam
): TuneDetailView {
  const candidate = Array.isArray(value) ? value[0] : value

  if (candidate === "reference" || candidate === "about") return candidate
  if (candidate === "community") return "about"

  return "practice"
}

export function getTuneDetailHref(pieceId: number, view: TuneDetailView) {
  const params = new URLSearchParams({ view })
  return `/library/${pieceId}?${params.toString()}`
}
