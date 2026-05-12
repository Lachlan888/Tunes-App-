import Link from "next/link"

type PracticeDiaryNavProps = {
  active: "review" | "diary" | "foci"
}

const links = [
  {
    href: "/review",
    label: "Review",
    value: "review",
  },
  {
    href: "/review/diary",
    label: "Diary",
    value: "diary",
  },
  {
    href: "/review/foci",
    label: "Foci",
    value: "foci",
  },
] as const

export default function PracticeDiaryNav({ active }: PracticeDiaryNavProps) {
  return (
    <nav className="mt-5 flex flex-wrap gap-2" aria-label="Practice sections">
      {links.map((link) => {
        const isActive = active === link.value

        return (
          <Link
            key={link.href}
            href={link.href}
            className={
              isActive
                ? "rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm"
                : "rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-muted hover:text-foreground"
            }
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}