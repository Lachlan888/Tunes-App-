import Link from "next/link"
import { joinClasses } from "@/components/ui/buttonStyles"

type PracticeDiaryNavProps = {
  active: "review" | "diary" | "index" | "foci"
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
    href: "/review/diary/index",
    label: "Index",
    value: "index",
  },
  {
    href: "/review/foci",
    label: "Foci",
    value: "foci",
  },
] as const

export default function PracticeDiaryNav({ active }: PracticeDiaryNavProps) {
  return (
    <nav
      className="mt-5 flex flex-wrap justify-center gap-2 md:justify-start"
      aria-label="Practice sections"
    >
      {links.map((link) => {
        const isActive = active === link.value

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={joinClasses(
              "rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]",
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background/70 text-muted-foreground hover:-translate-y-0.5 hover:bg-muted hover:text-foreground"
            )}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}