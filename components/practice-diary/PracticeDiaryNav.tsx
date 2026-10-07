import Link from "next/link"
import { joinClasses } from "@/components/ui/buttonStyles"
import { segmentedControlStyles } from "@/components/ui/segmentedControlStyles"

type PracticeDiaryNavProps = {
  active: "diary" | "index" | "foci"
  compact?: boolean
}

const links = [
  {
    href: "/review/diary",
    label: "Diary",
    value: "diary",
  },
  {
    href: "/review/foci",
    label: "Focus areas",
    value: "foci",
  },
  {
    href: "/review/diary/index",
    label: "Tune index & history",
    value: "index",
  },
] as const

export default function PracticeDiaryNav({
  active,
  compact = false,
}: PracticeDiaryNavProps) {
  return (
    <nav
      className={joinClasses(
        compact
          ? "inline-flex w-fit max-w-full flex-wrap justify-start self-start"
          : "mt-5 inline-flex max-w-full flex-wrap justify-center md:justify-start",
        segmentedControlStyles.group
      )}
      aria-label="Practice Diary sections"
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
