"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { normaliseCompareInviteCode } from "@/lib/compare-invites"

export default function EnterCompareCodeForm() {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [error, setError] = useState("")

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalised = normaliseCompareInviteCode(code)
    if (!normalised) {
      setError("Enter the complete code shown on the other musician’s screen.")
      return
    }
    router.push(`/compare/join/${encodeURIComponent(normalised)}`)
  }

  return (
    <form onSubmit={submit} className="mt-4">
      <label className="block text-sm font-semibold">
        Join with a code
        <input value={code} onChange={(event) => setCode(event.target.value)} autoComplete="off" autoCapitalize="words" spellCheck={false} placeholder="Monroe Mastertone Parlor" className="mt-2 min-h-12 w-full rounded-control border border-hairline bg-surface-paper px-3 text-base font-semibold" />
      </label>
      {error ? <p className="mt-2 text-sm text-destructive" role="alert">{error}</p> : null}
      <button type="submit" className="inline-flex mt-3 min-h-11 rounded-control border border-hairline px-4 text-sm font-semibold items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]">Enter code</button>
    </form>
  )
}
