"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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

function menuLinkIsActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function CountBadge({ count = 0 }: { count?: number }) {
  if (count <= 0) return null

  return (
    <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-control bg-surface-note px-1.5 py-0.5 text-[0.65rem] font-semibold leading-none text-text-primary">
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
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const pathname = usePathname()
  const isPracticeDiaryActive = menuLinkIsActive(pathname, "/review/diary") || menuLinkIsActive(pathname, "/review/foci")
  const initial = accountLabel?.trim().charAt(0).toUpperCase() || "A"

  useEffect(() => {
    if (isOpen) menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
  }, [isOpen])

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

    const railBreakpoint = window.matchMedia("(min-width: 768px)")
    function closeOnLayoutChange() { setIsOpen(false) }
    railBreakpoint.addEventListener("change", closeOnLayoutChange)
    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      railBreakpoint.removeEventListener("change", closeOnLayoutChange)
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  const links: MenuLink[] = [
    { href: "/dashboard", label: "Account & settings", icon: "settings" },
    { href: "/setlists", label: "Setlists", icon: "setlist" },
    { href: "/badges", label: "Badges", icon: "badge" },
    { href: "/trends", label: "Trends", icon: "trend" },
    { href: "/review/diary", label: "Practice Diary", icon: "book" },
  ]
  const socialLinks: MenuLink[] = [
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
          "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-control border border-hairline bg-surface-canvas text-sm font-semibold text-text-primary transition-colors hover:bg-surface-note focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
          compact ? "h-11 w-11 p-0" : "px-2.5"
        )}
      >
        <span className="grid h-8 w-8 place-items-center rounded-control bg-surface-note font-serif text-sm font-bold text-text-primary">
          {initial}
        </span>
        {compact ? null : <span className="max-w-32 truncate">Account</span>}
      </button>

      {isOpen ? (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label="Account and secondary navigation"
          onKeyDown={(event) => {
            if (event.key !== "ArrowDown" && event.key !== "ArrowUp" && event.key !== "Home" && event.key !== "End") return
            const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])
            const index = items.indexOf(document.activeElement as HTMLElement)
            const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : event.key === "ArrowDown" ? (index + 1) % items.length : (index - 1 + items.length) % items.length
            event.preventDefault()
            items[next]?.focus()
          }}
          className={joinClasses(
            "floating-material absolute z-[400] max-h-[calc(100dvh-9rem)] w-[min(20rem,calc(100vw-2rem))] overflow-y-auto rounded-sheet border border-hairline p-2 shadow-material-floating md:max-h-[calc(100dvh-5rem)]",
            placement === "above-right"
              ? "bottom-0 left-[calc(100%+0.75rem)]"
              : "right-0 top-[calc(100%+0.5rem)]"
          )}
        >
          <div className="border-b border-hairline px-3 py-2">
            <p className="truncate font-sans text-sm font-bold text-text-primary">{accountLabel || "Account"}</p>
          </div>

          <div className="grid gap-0.5 py-1">
            {links.map((item) => {
              const isActive = item.href === "/review/diary" ? isPracticeDiaryActive : menuLinkIsActive(pathname, item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setIsOpen(false)}
                  className={joinClasses(
                    buttonStyles.menuItem,
                    "border-l-2",
                    isActive
                      ? "border-action-primary bg-surface-note/50 text-text-primary"
                      : "border-transparent"
                  )}
                >
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                  <CountBadge count={item.count} />
                </Link>
              )
            })}

          </div>

          <div className="border-t border-hairline pt-1">
            <div className="grid gap-0.5">
              {socialLinks.map((item) => {
                const isActive = menuLinkIsActive(pathname, item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setIsOpen(false)}
                    className={joinClasses(
                      buttonStyles.menuItem,
                      "border-l-2",
                      isActive
                        ? "border-action-primary bg-surface-note/50 text-text-primary"
                        : "border-transparent"
                    )}
                  >
                    <Icon name={item.icon} />
                    <span>{item.label}</span>
                    <CountBadge count={item.count} />
                  </Link>
                )
              })}
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
                <Link href="/moderator" role="menuitem" aria-current={menuLinkIsActive(pathname, "/moderator") ? "page" : undefined} onClick={() => setIsOpen(false)} className={joinClasses(buttonStyles.menuItem, "border-l-2", menuLinkIsActive(pathname, "/moderator") ? "border-action-primary bg-surface-note/50 text-text-primary" : "border-transparent")}>
                  <Icon name="shield" />
                  <span>Moderator</span>
                  <CountBadge count={pendingModerationCount} />
                </Link>
              ) : null}
              {canAccessDev ? (
                <Link href="/dev" role="menuitem" aria-current={menuLinkIsActive(pathname, "/dev") ? "page" : undefined} onClick={() => setIsOpen(false)} className={joinClasses(buttonStyles.menuItem, "border-l-2", menuLinkIsActive(pathname, "/dev") ? "border-action-primary bg-surface-note/50 text-text-primary" : "border-transparent")}>
                  <Icon name="code" />
                  <span>Developer tools</span>
                </Link>
              ) : null}
            </div>
          ) : null}

          <div className="border-t border-hairline pt-1">
            <LogoutButton menuItem className={buttonStyles.destructiveMenuItem} />
          </div>
        </div>
      ) : null}
    </div>
  )
}
