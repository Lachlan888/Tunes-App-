"use client"

import { useFormStatus } from "react-dom"

type SubmitButtonProps = {
  label: string
  pendingLabel?: string
  className?: string
  forcePending?: boolean
  disabled?: boolean
  name?: string
  value?: string
}

export default function SubmitButton({
  label,
  pendingLabel,
  className = "",
  forcePending = false,
  disabled = false,
  name,
  value,
}: SubmitButtonProps) {
  const { pending } = useFormStatus()
  const isPending = pending || forcePending
  const isDisabled = disabled || isPending

  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      className={`${className} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {isPending ? pendingLabel ?? label : label}
    </button>
  )
}