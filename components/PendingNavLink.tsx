"use client"

import { useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"

type PendingNavLinkProps = {
  href: string
  label: string
}

export default function PendingNavLink({
  href,
  label,
}: PendingNavLinkProps) {
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
      className={`disabled:cursor-not-allowed disabled:opacity-60 ${
        isActive ? "font-semibold underline" : "underline"
      }`}
    >
      {isPending ? "Loading..." : label}
    </button>
  )
}