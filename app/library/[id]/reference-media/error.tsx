"use client"

import RecoveryState from "@/components/ui/RecoveryState"

export default function ReferenceMediaError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <RecoveryState
        headingAs="h1"
        title="Reference Mode could not be opened"
        description="Your selected recording remains in the address bar. Retry it, or return to the tune catalogue."
        primaryActionLabel="Retry"
        onPrimaryAction={reset}
        secondaryActionHref="/library"
        secondaryActionLabel="Back to Tunes"
      />
    </main>
  )
}
