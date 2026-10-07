"use client"

import RecoveryState from "@/components/ui/RecoveryState"

export default function SharedListsErrorState() {
  return (
    <main className="mx-auto max-w-[1500px] px-4 pb-5 pt-0 text-foreground md:px-6 md:py-8">
      <RecoveryState
        headingAs="h1"
        title="Public lists are unavailable"
        description="Check your connection and try again."
        primaryActionLabel="Retry public lists"
        onPrimaryAction={() => window.location.reload()}
      />
    </main>
  )
}
