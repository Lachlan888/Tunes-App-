export function buildCompareJoinPath(token: string) {
  return `/compare/join/${encodeURIComponent(token)}`
}

export function buildSingleUserComparePath(username: string | null) {
  if (!username) return "/compare"

  const params = new URLSearchParams({ user: username })
  return `/compare?${params.toString()}`
}
