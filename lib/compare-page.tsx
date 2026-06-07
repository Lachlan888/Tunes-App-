import Link from "next/link"

export function toArray(value: string | string[] | undefined) {
  if (!value) return []
  return Array.isArray(value) ? value.filter(Boolean) : [value]
}

export function getIncludePracticeFromParam(
  value: string | string[] | undefined
) {
  const firstValue = Array.isArray(value) ? value[0] : value
  return firstValue === "1" || firstValue === "true"
}

export function buildCompareHref(
  users: string[],
  extraParams?: {
    q?: string
    key?: string[]
    style?: string[]
    time_signature?: string[]
    includePractice?: boolean
    userSearch?: string
  }
) {
  const params = new URLSearchParams()

  users.forEach((user) => {
    params.append("user", user)
  })

  if (extraParams?.includePractice) {
    params.set("include_practice", "1")
  }

  if (extraParams?.userSearch?.trim()) {
    params.set("user_search", extraParams.userSearch.trim())
  }

  if (extraParams?.q) {
    params.set("q", extraParams.q)
  }

  extraParams?.key?.forEach((value) => {
    params.append("key", value)
  })

  extraParams?.style?.forEach((value) => {
    params.append("style", value)
  })

  extraParams?.time_signature?.forEach((value) => {
    params.append("time_signature", value)
  })

  const query = params.toString()
  return query ? `/compare?${query}` : "/compare"
}

export function addConfirmedCompareUser(users: string[], selectedUsername: string) {
  const safeSelectedUsername = selectedUsername.trim()

  if (!safeSelectedUsername) {
    return users.filter(Boolean)
  }

  const nextUsers = users.map((user) => user.trim()).filter(Boolean)
  const alreadySelected = nextUsers.some(
    (user) => user.toLowerCase() === safeSelectedUsername.toLowerCase()
  )

  if (!alreadySelected) {
    nextUsers.push(safeSelectedUsername)
  }

  return nextUsers
}

export function removeUserOnce(users: string[], userToRemove: string) {
  let removed = false

  return users.filter((user) => {
    if (!removed && user.toLowerCase() === userToRemove.toLowerCase()) {
      removed = true
      return false
    }

    return true
  })
}

export function renderProfileLink(
  username: string | null,
  label: string | null | undefined
) {
  const safeLabel = label || username || "Unnamed player"

  if (!username) {
    return <span>{safeLabel}</span>
  }

  return (
    <Link href={`/users/${username}`} className="underline hover:no-underline">
      {safeLabel}
    </Link>
  )
}
