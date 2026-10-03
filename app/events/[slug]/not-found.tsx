import Link from "next/link"
import { buttonStyles } from "@/components/ui/buttonStyles"

export default function FestivalNotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center text-text-primary md:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">Festival hub</p>
      <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight">This festival hub isn’t available</h1>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-text-muted md:text-base">
        The address may be incorrect, or this hub may not be published yet.
      </p>
      <Link href="/" className={`${buttonStyles.secondaryStrong} mt-7`}>
        Back to Home
      </Link>
    </main>
  )
}
