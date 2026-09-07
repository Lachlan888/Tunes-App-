import { LoadingState } from "@/components/ui/Skeleton"

export default function Loading() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-12 text-text-primary md:px-6">
      <LoadingState label="Loading your tunes" rows={4} />
    </main>
  )
}
