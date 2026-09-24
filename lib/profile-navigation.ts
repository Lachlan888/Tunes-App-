export const PROFILE_TABS = ['overview', 'repertoire', 'lists', 'badges'] as const
export type ProfileTab = typeof PROFILE_TABS[number]
export type ProfileQuery = { tab: ProfileTab; q: string; page: number; group: 'known' | 'practice' | 'composed'; preview: boolean }
export const PROFILE_PAGE_SIZE = 20
export function parseProfileQuery(params: Record<string, string | string[] | undefined> = {}): ProfileQuery {
  const one = (key: string) => { const value = params[key]; return Array.isArray(value) ? value[0] : value }
  const tab = one('tab')
  const page = Number(one('page'))
  const group = one('group')
  return { tab: PROFILE_TABS.includes(tab as ProfileTab) ? tab as ProfileTab : 'overview', q: (one('q') ?? '').trim().slice(0, 100), page: Number.isSafeInteger(page) && page > 0 ? Math.min(page, 10000) : 1, group: group === 'practice' || group === 'composed' ? group : 'known', preview: one('preview') === 'public' }
}
export function profileHref(username: string, query: ProfileQuery, changes: Partial<ProfileQuery> = {}) {
  const value = { ...query, ...changes }
  const params = new URLSearchParams({ tab: value.tab })
  if (value.q) params.set('q', value.q)
  if (value.page > 1) params.set('page', String(value.page))
  if (value.tab === 'repertoire') params.set('group', value.group)
  if (value.preview) params.set('preview', 'public')
  return `/users/${encodeURIComponent(username)}?${params}`
}
export function canBrowseProfileRepertoire(owner: boolean, friend: boolean, shared: boolean, preview: boolean) {
  return !preview && (owner || (friend && shared))
}
/** A literal search pattern, never a PostgREST expression. */
export function profileSearchPattern(query: string) {
  return `%${query.replace(/[\\%_]/g, '\\$&')}%`
}
