"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

type PendingLinkButtonProps = {
  href: string
  label: string
  pendingLabel?: string
  className?: string
  refresh?: boolean
}

export default function PendingLinkButton({
  href,
  label,
  pendingLabel,
  className = "",
  refresh = false,
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
          if (refresh) {
            router.refresh()
          }
        })
      }}
      className={`${className} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {isPending ? (
        <span className="inline-flex items-center justify-center gap-2">
          <LoadingSpinner
            label={pendingLabel ?? label}
            size="sm"
            decorative
          />
          <span>{pendingLabel ?? label}</span>
        </span>
      ) : (
        label
      )}
    </button>
  )
}
