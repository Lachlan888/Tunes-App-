import Link from "next/link"
import { joinClasses } from "@/components/ui/buttonStyles"
import { segmentedControlStyles } from "@/components/ui/segmentedControlStyles"

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
    label: "Focus areas",
    value: "foci",
  },
] as const

export default function PracticeDiaryNav({ active }: PracticeDiaryNavProps) {
  return (
    <nav
      className={joinClasses(
        "mt-5 flex flex-wrap justify-center md:justify-start",
        segmentedControlStyles.group
      )}
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
              segmentedControlStyles.item,
              "px-4",
              isActive
                ? segmentedControlStyles.active
                : segmentedControlStyles.inactive
            )}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
