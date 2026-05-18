export type CompareSearchParams = {
  user?: string | string[]
  q?: string | string[]
  key?: string | string[]
  style?: string | string[]
  time_signature?: string | string[]
  include_practice?: string | string[]
  friend_request?: string
  page_options?: string | string[]
}

export function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? ""
}

export function toArray(value: string | string[] | undefined) {
  if (!value) return []

  const values = Array.isArray(value) ? value : [value]

  return values.map((item) => item.trim()).filter(Boolean)
}

export function getIncludePracticeFromParam(
  value: string | string[] | undefined
) {
  const rawValue = getSingleValue(value)

  return rawValue === "1" || rawValue === "true"
}

export function buildCompareHref(
  selectedUsers: string[],
  options: {
    includePractice?: boolean
  } = {}
) {
  const params = new URLSearchParams()

  for (const selectedUser of selectedUsers) {
    if (selectedUser) {
      params.append("user", selectedUser)
    }
  }

  if (options.includePractice) {
    params.set("include_practice", "1")
  }

  const query = params.toString()

  return query ? `/compare?${query}` : "/compare"
}

export function getComparePageParams(
  searchParams: CompareSearchParams | undefined
) {
  const selectedUsers = toArray(searchParams?.user)
  const primarySearchValue = selectedUsers[selectedUsers.length - 1] ?? ""

  const titleQuery = getSingleValue(searchParams?.q)
  const includePractice = getIncludePracticeFromParam(
    searchParams?.include_practice
  )

  const selectedKeys = toArray(searchParams?.key)
  const selectedStyles = toArray(searchParams?.style)
  const selectedTimeSignatures = toArray(searchParams?.time_signature)

  const friendRequestStatus = searchParams?.friend_request ?? ""
  const pageOptionsStatus = getSingleValue(searchParams?.page_options)

  const hasActiveFilters =
    titleQuery !== "" ||
    selectedKeys.length > 0 ||
    selectedStyles.length > 0 ||
    selectedTimeSignatures.length > 0

  return {
    selectedUsers,
    primarySearchValue,
    titleQuery,
    includePractice,
    selectedKeys,
    selectedStyles,
    selectedTimeSignatures,
    friendRequestStatus,
    pageOptionsStatus,
    hasActiveFilters,
  }
}