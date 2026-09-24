import Link from "next/link"
import type { ReactNode } from "react"
import { cardStyles } from "@/components/ui/cardStyles"
import { joinClasses } from "@/components/ui/buttonStyles"

/** Whole-object link. Children must be non-interactive; cards with actions use article + title link. */
export default function ClickableCard({ href, ariaLabel, children, compact = false, className }: {
  href: string
  ariaLabel: string
  children: ReactNode
  compact?: boolean
  className?: string
}) {
  return <Link href={href} aria-label={ariaLabel} className={joinClasses(compact ? cardStyles.compactClickableCard : cardStyles.clickableCard, className)}>{children}</Link>
}
