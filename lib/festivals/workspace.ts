export const festivalWorkspaceTabs = ["details", "repertoire", "sessions", "review"] as const
export type FestivalWorkspaceTab = typeof festivalWorkspaceTabs[number]

type WorkspaceSearch = {
  festival?: string | string[]
  tab?: string | string[]
}

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export function resolveFestivalWorkspace(
  search: WorkspaceSearch,
  selectedFestivalId: number | null,
  festivals: Array<{ id: number }>
): { festivalId: number | null; tab: FestivalWorkspaceTab } {
  const requested = Number(single(search.festival))
  const festivalId = festivals.some((festival) => festival.id === requested)
    ? requested
    : festivals.some((festival) => festival.id === selectedFestivalId)
      ? selectedFestivalId
      : festivals[0]?.id ?? null
  const requestedTab = single(search.tab)
  const tab = festivalWorkspaceTabs.find((candidate) => candidate === requestedTab) ?? "details"
  return { festivalId, tab }
}

export function festivalWorkspaceHref(festivalId: number, tab: FestivalWorkspaceTab) {
  return `/dev/festivals?festival=${festivalId}&tab=${tab}`
}
