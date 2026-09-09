"use client"

import Link from "next/link"
import { useEffect, useId, useRef, useState } from "react"
import LogoutButton from "@/components/LogoutButton"
import Icon, { type IconName } from "@/components/ui/Icon"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import { OPEN_FEEDBACK_EVENT, OPEN_METRONOME_EVENT } from "@/lib/ui-events"

type AccountMenuProps = {
  accountLabel?: string | null
  unreadTotalCount: number
  pendingModerationCount: number
  canModerate: boolean
  canAccessDev: boolean
  placement?: "below" | "above-right"
  compact?: boolean
}

type MenuLink = {
  href: string
  label: string
  icon: IconName
  count?: number
}

function CountBadge({ count = 0 }: { count?: number }) {
  if (count <= 0) return null

  return (
    <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-pill bg-state-overdue px-1.5 py-0.5 text-[0.65rem] font-semibold leading-none text-state-overdue-foreground">
      {count > 99 ? "99+" : count}
    </span>
  )
}

export default function AccountMenu({
  accountLabel,
  unreadTotalCount,
  pendingModerationCount,
  canModerate,
  canAccessDev,
  placement = "below",
  compact = false,
}: AccountMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()
  const initial = accountLabel?.trim().charAt(0).toUpperCase() || "A"

  useEffect(() => {
    if (!isOpen) return

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return
      setIsOpen(false)
      triggerRef.current?.focus()
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  const links: MenuLink[] = [
    { href: "/dashboard", label: "Account & settings", icon: "settings" },
    { href: "/public-lists", label: "Browse public lists", icon: "book" },
    { href: "/setlists", label: "Setlists", icon: "setlist" },
    { href: "/badges", label: "Badges", icon: "badge" },
    { href: "/trends", label: "Trends", icon: "trend" },
  ]
  const socialLinks: MenuLink[] = [
    { href: "/friends", label: "Friends", icon: "social" },
    { href: "/inbox", label: "Inbox", icon: "inbox", count: unreadTotalCount },
  ]

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Open account menu"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={() => setIsOpen((current) => !current)}
        className={joinClasses(
          "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-control border border-hairline bg-surface-paper text-sm font-semibold text-text-primary shadow-material-rest transition-colors hover:bg-surface-note focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
          compact ? "h-11 w-11 p-0" : "px-2.5"
        )}
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-state-social font-serif text-sm font-bold text-state-social-foreground">
          {initial}
        </span>
        {compact ? null : <span className="max-w-32 truncate">Account</span>}
      </button>

      {isOpen ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Account and secondary navigation"
          className={joinClasses(
            "floating-material absolute z-[400] w-[min(20rem,calc(100vw-2rem))] rounded-sheet border border-hairline p-2 shadow-material-floating",
            placement === "above-right"
              ? "bottom-0 left-[calc(100%+0.75rem)]"
              : "right-0 top-[calc(100%+0.5rem)]"
          )}
        >
          <div className="border-b border-hairline px-3 py-2">
            <p className="font-serif text-base font-semibold text-text-primary">Your tunebook</p>
            {accountLabel ? (
              <p className="truncate text-xs text-text-muted">{accountLabel}</p>
            ) : null}
          </div>

          <div className="grid gap-0.5 py-1">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className={buttonStyles.menuItem}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
                <CountBadge count={item.count} />
              </Link>
            ))}
          </div>

          <div className="border-t border-hairline pt-1">
            <p className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
              Social
            </p>
            <div className="grid gap-0.5">
              {socialLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  onClick={() => setIsOpen(false)}
                  className={buttonStyles.menuItem}
                >
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                  <CountBadge count={item.count} />
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-0.5 border-t border-hairline pt-1">
            <button
              type="button"
              role="menuitem"
              className={buttonStyles.menuItem}
              onClick={() => {
                window.dispatchEvent(new Event(OPEN_METRONOME_EVENT))
                setIsOpen(false)
              }}
            >
              <Icon name="metronome" />
              <span>Metronome</span>
            </button>
            <button
              type="button"
              role="menuitem"
              className={buttonStyles.menuItem}
              onClick={() => {
                window.dispatchEvent(new Event(OPEN_FEEDBACK_EVENT))
                setIsOpen(false)
              }}
            >
              <Icon name="feedback" />
              <span>Help & feedback</span>
            </button>
          </div>

          {canModerate || canAccessDev ? (
            <div className="grid gap-0.5 border-t border-hairline pt-1">
              {canModerate ? (
                <Link href="/moderator" role="menuitem" onClick={() => setIsOpen(false)} className={buttonStyles.menuItem}>
                  <Icon name="shield" />
                  <span>Moderator</span>
                  <CountBadge count={pendingModerationCount} />
                </Link>
              ) : null}
              {canAccessDev ? (
                <Link href="/dev" role="menuitem" onClick={() => setIsOpen(false)} className={buttonStyles.menuItem}>
                  <Icon name="code" />
                  <span>Developer tools</span>
                </Link>
              ) : null}
            </div>
          ) : null}

          <div className="border-t border-hairline pt-1">
            <LogoutButton className={buttonStyles.destructiveMenuItem} />
          </div>
        </div>
      ) : null}
    </div>
  )
}
