"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { isValidCompareInviteToken, normaliseCompareInviteCode } from "@/lib/compare-invites"

export default function EnterCompareCodeForm() {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [error, setError] = useState("")

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalised = normaliseCompareInviteCode(code)
    if (!isValidCompareInviteToken(normalised)) {
      setError("Enter the complete code shown on the other musician’s screen.")
      return
    }
    router.push(`/compare/join/${encodeURIComponent(normalised)}`)
  }

  return (
    <form onSubmit={submit} className="mt-4">
      <label className="block text-sm font-semibold">
        Join with a code
        <input value={code} onChange={(event) => setCode(event.target.value)} autoComplete="off" spellCheck={false} placeholder="Paste or type the full code" className="mt-2 min-h-12 w-full rounded-control border border-hairline bg-surface-paper px-3 font-mono text-sm" />
      </label>
      {error ? <p className="mt-2 text-sm text-destructive" role="alert">{error}</p> : null}
      <button type="submit" className="mt-3 min-h-11 rounded-full border border-hairline px-4 text-sm font-semibold">Enter code</button>
    </form>
  )
}
