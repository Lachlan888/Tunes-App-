export const TUNE_DETAIL_VIEWS = ["info", "reference"] as const

export type TuneDetailView = (typeof TUNE_DETAIL_VIEWS)[number]
export type TuneDetailSearchParam = string | string[] | undefined

export function resolveTuneDetailView(
  value: TuneDetailSearchParam
): TuneDetailView {
  const candidate = Array.isArray(value) ? value[0] : value

  return candidate === "reference" ? "reference" : "info"
}

export function isLegacyTuneDetailView(value: TuneDetailSearchParam) {
  const candidate = Array.isArray(value) ? value[0] : value
  return candidate === "practice" || candidate === "about" || candidate === "overview" || candidate === "community"
}

export function getLegacyTuneDetailHash(value: TuneDetailSearchParam) {
  const candidate = Array.isArray(value) ? value[0] : value
  if (candidate === "practice") return "#practice"
  if (candidate === "about") return "#catalogue"
  if (candidate === "community") return "#community"
  return ""
}

export function getTuneDetailHref(pieceId: number, view: TuneDetailView) {
  if (view === "reference") return `/library/${pieceId}/reference-media`
  return `/library/${pieceId}`
}
