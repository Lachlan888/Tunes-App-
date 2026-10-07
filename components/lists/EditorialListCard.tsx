import Link from "next/link"
import type { ReactNode } from "react"

export default function EditorialListCard({ title, href, children }: { id: number; title: string; href: string; children: ReactNode }) {
  return <article className="flex h-full min-w-0 flex-col border-b border-hairline py-5">
    <header className="flex items-center">
      <h2 className="min-w-0 break-words font-sans text-2xl font-bold leading-tight text-text-primary sm:text-3xl"><Link href={href} className="inline-flex min-h-11 max-w-full items-center decoration-2 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4">{title}</Link></h2>
    </header>
    <div className="mt-3 flex flex-1 flex-col gap-3">{children}</div>
  </article>
}
