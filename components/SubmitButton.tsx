"use client"

import { useFormStatus } from "react-dom"

type SubmitButtonProps = {
  label: string
  pendingLabel?: string
  className?: string
}

export default function SubmitButton({
  label,
  pendingLabel,
  className = "",
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={`${className} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {pending ? pendingLabel ?? label : label}
    </button>
  )
}