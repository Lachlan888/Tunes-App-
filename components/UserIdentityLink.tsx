import Link from "next/link"

type UserIdentityLinkProps = {
  username: string | null
  displayName: string | null
  fallbackLabel?: string
  className?: string
  handleClassName?: string
  showHandle?: boolean
}

export default function UserIdentityLink({
  username,
  displayName,
  fallbackLabel = "Unnamed player",
  className = "font-medium text-foreground underline underline-offset-4 transition hover:text-primary",
  handleClassName = "text-sm text-muted-foreground underline underline-offset-4 transition hover:text-foreground",
  showHandle = false,
}: UserIdentityLinkProps) {
  const label = displayName || username || fallbackLabel

  if (!username) {
    return <span>{label}</span>
  }

  const href = `/users/${encodeURIComponent(username)}`

  if (showHandle) {
    return (
      <Link href={href} className={handleClassName}>
        @{username}
      </Link>
    )
  }

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  )
}
