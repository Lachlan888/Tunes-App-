import type { ReactNode } from "react"

/** Native disclosure + required confirmation also protect the pre-hydration form. */
export default function ConfirmedActionForm({ action, scope, children, className = "" }: {
  action: (formData: FormData) => void | Promise<void>
  scope: string
  children: ReactNode
  className?: string
}) {
  return <details className={`rounded-control border border-border p-3 ${className}`}>
    <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold">Review action</summary>
    <p className="my-3 text-sm">{scope}</p>
    <form action={action} className="space-y-3">
      <label className="flex min-h-11 items-center gap-3 text-sm font-medium">
        <input type="checkbox" required name="confirm_action" value="confirmed" className="h-5 w-5" />
        I have reviewed this action and its scope.
      </label>
      {children}
    </form>
  </details>
}
