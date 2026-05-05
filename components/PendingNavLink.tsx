"use client"

import { useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"

type PendingNavLinkProps = {
  href: string
  label: string
}

export default function PendingNavLink({ href, label }: PendingNavLinkProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const isActive = pathname === href

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
      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-70 ${
        isActive
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-transparent text-foreground hover:border-border hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
      }`}
    >
      {isPending ? "Loading..." : label}
    </button>
  )
}