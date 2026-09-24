"use client"

import RecoveryState from "@/components/ui/RecoveryState"

export default function LibraryError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <RecoveryState
        headingAs="h1"
        title="The tune collection could not be loaded"
        description="Your search and filters are still in the address bar. Try loading this view again."
        primaryActionLabel="Retry"
        onPrimaryAction={reset}
      />
    </main>
  )
}
