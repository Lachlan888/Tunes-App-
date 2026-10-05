import Link from "next/link"
import { buttonStyles } from "@/components/ui/buttonStyles"

export default function FestivalNotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center text-text-primary md:px-6">
      <h1 className="font-sans text-4xl font-bold tracking-tight">This festival hub isn’t available</h1>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-text-muted md:text-base">
        The address may be incorrect, or this hub may not be published yet.
      </p>
      <Link href="/" className={`${buttonStyles.secondaryStrong} mt-7`}>
        Back to Home
      </Link>
    </main>
  )
}
