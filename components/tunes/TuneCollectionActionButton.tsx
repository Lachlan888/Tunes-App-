"use client"

import { useTransition } from "react"

type ActionFieldValue = string | number | boolean | null | undefined

type TuneCollectionActionButtonProps = {
  action: (formData: FormData) => Promise<void>
  fields: Record<string, ActionFieldValue>
  label: string
  pendingLabel: string
  className?: string
  confirmMessage?: string
}

/**
 * One event-driven action control for repeated tune rows. This avoids adding a
 * separate form subtree for every row while keeping authorization in the
 * server action.
 */
export default function TuneCollectionActionButton({
  action,
  fields,
  label,
  pendingLabel,
  className,
  confirmMessage,
}: TuneCollectionActionButtonProps) {
  const [isPending, startTransition] = useTransition()

  function runAction() {
    if (confirmMessage && !window.confirm(confirmMessage)) return

    const formData = new FormData()

    for (const [name, value] of Object.entries(fields)) {
      if (value === null || value === undefined) continue
      formData.set(name, String(value))
    }

    startTransition(() => action(formData))
  }

  return (
    <button
      type="button"
      className={className}
      disabled={isPending}
      aria-busy={isPending}
      onClick={runAction}
    >
      {isPending ? pendingLabel : label}
    </button>
  )
}
