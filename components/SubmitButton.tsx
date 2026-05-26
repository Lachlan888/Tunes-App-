"use client"

import { useFormStatus } from "react-dom"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

type SubmitButtonProps = {
  label: string
  pendingLabel?: string
  className?: string
  forcePending?: boolean
  disabled?: boolean
  name?: string
  value?: string
  title?: string
  ariaDescribedBy?: string
}

export default function SubmitButton({
  label,
  pendingLabel,
  className = "",
  forcePending = false,
  disabled = false,
  name,
  value,
  title,
  ariaDescribedBy,
}: SubmitButtonProps) {
  const { pending } = useFormStatus()
  const isPending = pending || forcePending
  const isDisabled = disabled || isPending

  return (
    <button
      type="submit"
      name={name}
      value={value}
      title={title}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-describedby={ariaDescribedBy}
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
