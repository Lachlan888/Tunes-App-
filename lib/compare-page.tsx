import Link from "next/link"

export function toArray(value: string | string[] | undefined) {
  if (!value) return []
  return Array.isArray(value) ? value.filter(Boolean) : [value]
}

export function buildCompareHref(
  users: string[],
  extraParams?: {
    q?: string
    key?: string[]
    style?: string[]
    time_signature?: string[]
  }
) {
  const params = new URLSearchParams()

  users.forEach((user) => {
    params.append("user", user)
  })

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
  const safeLabel = label || username || "Unnamed user"

  if (!username) {
    return <span>{safeLabel}</span>
  }

  return (
    <Link href={`/users/${username}`} className="underline hover:no-underline">
      {safeLabel}
    </Link>
  )
}