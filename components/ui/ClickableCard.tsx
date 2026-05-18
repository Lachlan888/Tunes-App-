"use client"

import { useRouter } from "next/navigation"
import type { KeyboardEvent, MouseEvent, ReactNode } from "react"
import { cardStyles } from "@/components/ui/cardStyles"
import { clickedInsideInteractiveElement } from "@/components/ui/cardInteraction"
import { joinClasses } from "@/components/ui/buttonStyles"

type ClickableCardElement = "article" | "section" | "div"

type ClickableCardProps = {
  href: string
  ariaLabel: string
  children: ReactNode
  as?: ClickableCardElement
  compact?: boolean
  className?: string
}

export default function ClickableCard({
  href,
  ariaLabel,
  children,
  as = "article",
  compact = false,
  className,
}: ClickableCardProps) {
  const router = useRouter()
  const baseClassName = compact
    ? cardStyles.compactClickableCard
    : cardStyles.clickableCard

  function openTarget() {
    router.push(href)
  }

  function handleClick(event: MouseEvent<HTMLElement>) {
    if (clickedInsideInteractiveElement(event.target, event.currentTarget)) {
      return
    }

    openTarget()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (clickedInsideInteractiveElement(event.target, event.currentTarget)) {
      return
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      openTarget()
    }
  }

  const sharedProps = {
    className: joinClasses(baseClassName, className),
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    tabIndex: 0,
    role: "link",
    "aria-label": ariaLabel,
  }

  if (as === "section") {
    return <section {...sharedProps}>{children}</section>
  }

  if (as === "div") {
    return <div {...sharedProps}>{children}</div>
  }

  return <article {...sharedProps}>{children}</article>
}