"use client"

import { useState } from "react"
import CompareInPersonSheet, { QrIcon } from "@/components/compare/CompareInPersonSheet"
import EnterCompareCodeForm from "@/components/compare/EnterCompareCodeForm"

export default function CompareInPersonLauncher() {
  const [open, setOpen] = useState(false)
  return (
    <section className="mb-8 border-y border-border py-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">IN THE ROOM TOGETHER</p>
      <h2 className="mt-1 text-xl font-semibold">Compare in person</h2>
      <p className="mt-2 text-sm text-muted-foreground">Create a ten-minute private invitation, or enter the complete code on another musician’s screen.</p>
      <button type="button" onClick={() => setOpen(true)} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground"><QrIcon /> Create join code</button>
      <EnterCompareCodeForm />
      <CompareInPersonSheet isOpen={open} onClose={() => setOpen(false)} />
    </section>
  )
}
