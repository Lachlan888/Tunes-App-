"use client"

import RecoveryState from "@/components/ui/RecoveryState"

export default function Error({ reset }: { reset: () => void }) {
  return <main className="mx-auto max-w-3xl px-4 py-10">
    <RecoveryState headingAs="h1" title="This view could not be loaded" description="Check your connection and retry. Your saved work remains on the server; unsaved changes may need to be entered again." primaryActionLabel="Retry this view" onPrimaryAction={reset} secondaryActionHref="/" secondaryActionLabel="Go to Home" />
  </main>
}
