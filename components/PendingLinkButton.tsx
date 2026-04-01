"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"

type PendingLinkButtonProps = {
  href: string
  label: string
  pendingLabel?: string
  className?: string
}

export default function PendingLinkButton({
  href,
  label,
  pendingLabel,
  className = "",
}: PendingLinkButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        startTransition(() => {
          router.push(href)
        })
      }}
      className={`${className} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {isPending ? pendingLabel ?? label : label}
    </button>
  )
}