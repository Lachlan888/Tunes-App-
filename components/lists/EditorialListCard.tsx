import Link from "next/link"
import type { ReactNode } from "react"

export default function EditorialListCard({ id, title, href, children }: { id: number; title: string; href: string; children: ReactNode }) {
  return <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-object border border-hairline bg-surface-paper shadow-material-rest">
    <header className={`flex min-h-32 items-center border-b border-hairline p-5 sm:p-6 ${id % 3 === 0 ? "bg-success/15" : id % 3 === 1 ? "bg-primary/15" : "bg-warning/15"}`}>
      <h2 className="min-w-0 break-words font-serif text-3xl font-bold leading-tight text-text-primary sm:text-4xl"><Link href={href} className="decoration-2 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4">{title}</Link></h2>
    </header>
    <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">{children}</div>
  </article>
}
