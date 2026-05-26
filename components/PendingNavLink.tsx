"use client"

import { useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"
import { navItemIsActive } from "@/components/layout/navItems"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

type PendingNavLinkProps = {
  href: string
  label: string
  badgeCount?: number
  size?: "default" | "compact"
}

function NavBadge({ count }: { count: number }) {
  if (count <= 0) return null

  return (
    <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 py-0.5 text-xs font-semibold leading-none text-destructive-foreground">
      {count > 99 ? "99+" : count}
    </span>
  )
}

export default function PendingNavLink({
  href,
  label,
  badgeCount = 0,
  size = "default",
}: PendingNavLinkProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const isActive = navItemIsActive(pathname, href)

  const sizeClasses =
    size === "compact" ? "px-2.5 py-1.5 text-sm" : "px-3 py-1.5 text-sm"

  return (
    <button
      type="button"
      disabled={isPending || isActive}
      aria-disabled={isPending || isActive}
      aria-current={isActive ? "page" : undefined}
      onClick={() => {
        if (isPending || isActive) return

        startTransition(() => {
          router.push(href)
        })
      }}
      className={`inline-flex shrink-0 items-center rounded-full border font-medium transition disabled:cursor-not-allowed disabled:opacity-70 ${sizeClasses} ${
        isActive
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-transparent text-foreground hover:border-border hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
      }`}
    >
      <span className="inline-flex items-center gap-1.5">
        {isPending ? (
          <LoadingSpinner label="Loading..." size="sm" decorative />
        ) : null}
        <span>{label}</span>
      </span>
      <NavBadge count={badgeCount} />
    </button>
  )
}
