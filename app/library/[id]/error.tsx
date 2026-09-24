"use client"

import RecoveryState from "@/components/ui/RecoveryState"

export default function TuneDetailError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <RecoveryState
        headingAs="h1"
        title="This tune could not be loaded"
        description="Your selected view is still in the address bar. Retry it, or return to the tune catalogue."
        primaryActionLabel="Retry"
        onPrimaryAction={reset}
        secondaryActionHref="/library"
        secondaryActionLabel="Back to Tunes"
      />
    </main>
  )
}
