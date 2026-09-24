import RecoveryState from "@/components/ui/RecoveryState"

export default function NotFound() {
  return <main className="mx-auto max-w-3xl px-4 py-10">
    <RecoveryState headingAs="h1" title="This page is unavailable" description="The link may be out of date, or this view may not be shared with you." primaryActionHref="/library" primaryActionLabel="Browse Tunes" secondaryActionHref="/" secondaryActionLabel="Go to Home" />
  </main>
}
