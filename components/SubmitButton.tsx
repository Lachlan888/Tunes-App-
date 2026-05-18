"use client"

import { useFormStatus } from "react-dom"

type SubmitButtonProps = {
  label: string
  pendingLabel?: string
  className?: string
  forcePending?: boolean
  disabled?: boolean
}

export default function SubmitButton({
  label,
  pendingLabel,
  className = "",
  forcePending = false,
  disabled = false,
}: SubmitButtonProps) {
  const { pending } = useFormStatus()
  const isPending = pending || forcePending
  const isDisabled = disabled || isPending

  return (
    <button
      type="submit"
      disabled={isDisabled}
      aria-disabled={isDisabled}
      className={`${className} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {isPending ? pendingLabel ?? label : label}
    </button>
  )
}