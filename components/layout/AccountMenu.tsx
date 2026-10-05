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

const practiceToolLinks: MenuLink[] = [
  { href: "/review/diary", label: "Practice Diary", icon: "book" },
  { href: "/review/foci", label: "Focus areas", icon: "practice" },
  { href: "/review/diary/index", label: "Tune index & history", icon: "list" },
]

function menuLinkIsActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
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
  const [isPracticeToolsOpen, setIsPracticeToolsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const practiceToolsTriggerRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()
  const practiceToolsId = useId()
  const pathname = usePathname()
  const activePracticeHref = practiceToolLinks
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href
  const initial = accountLabel?.trim().charAt(0).toUpperCase() || "A"

  useEffect(() => {
    if (!isOpen) return

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return
      if (isPracticeToolsOpen) {
        setIsPracticeToolsOpen(false)
        practiceToolsTriggerRef.current?.focus()
        return
      }
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
  }, [isOpen, isPracticeToolsOpen])

  const links: MenuLink[] = [
    { href: "/dashboard", label: "Account & settings", icon: "settings" },
    { href: "/setlists", label: "Setlists", icon: "setlist" },
    { href: "/badges", label: "Badges", icon: "badge" },
    { href: "/trends", label: "Trends", icon: "trend" },
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
        onClick={() => setIsOpen((current) => {
          if (current) setIsPracticeToolsOpen(false)
          else setIsPracticeToolsOpen(Boolean(activePracticeHref))
          return !current
        })}
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
            "floating-material absolute max-h-[calc(100dvh-5rem)] overflow-y-auto z-[400] w-[min(20rem,calc(100vw-2rem))] rounded-sheet border border-hairline p-2 shadow-material-floating",
            placement === "above-right"
              ? "bottom-0 left-[calc(100%+0.75rem)]"
              : "right-0 top-[calc(100%+0.5rem)]"
          )}
        >
          <div className="border-b border-hairline px-3 py-2">
            <p className="font-sans text-sm font-bold text-text-primary">Your tunebook</p>
            {accountLabel ? (
              <p className="truncate text-xs text-text-muted">{accountLabel}</p>
            ) : null}
          </div>

          <div className="grid gap-0.5 py-1">
            {links.map((item) => {
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

            <button
              ref={practiceToolsTriggerRef}
              type="button"
              role="menuitem"
              aria-haspopup="menu"
              aria-expanded={isPracticeToolsOpen}
              aria-controls={practiceToolsId}
              onClick={() => setIsPracticeToolsOpen((current) => !current)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight") {
                  event.preventDefault()
                  setIsPracticeToolsOpen(true)
                }
                if (event.key === "ArrowLeft") {
                  event.preventDefault()
                  setIsPracticeToolsOpen(false)
                }
              }}
              className={joinClasses(
                buttonStyles.menuItem,
                "border-l-2",
                activePracticeHref
                  ? "border-action-primary bg-surface-note/50 text-text-primary"
                  : "border-transparent"
              )}
            >
              <Icon name="practice" />
              <span>Practice tools</span>
              <span aria-hidden="true" className="ml-auto text-xs">{isPracticeToolsOpen ? "▲" : "▼"}</span>
            </button>

            {isPracticeToolsOpen ? (
              <div id={practiceToolsId} role="group" aria-label="Practice tools" className="grid gap-0.5 border-l border-hairline pl-3">
                {practiceToolLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    aria-current={activePracticeHref === item.href ? "page" : undefined}
                    onClick={() => {
                      setIsPracticeToolsOpen(false)
                      setIsOpen(false)
                    }}
                    className={joinClasses(
                      buttonStyles.menuItem,
                      "border-l-2",
                      activePracticeHref === item.href
                        ? "border-state-practice bg-surface-note/50 text-text-primary"
                        : "border-transparent"
                    )}
                  >
                    <Icon name={item.icon} />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          <div className="border-t border-hairline pt-1">
            <p className="px-3 py-2 font-sans text-xs font-medium text-text-muted">
              Social
            </p>
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
            <LogoutButton className={buttonStyles.destructiveMenuItem} />
          </div>
        </div>
      ) : null}
    </div>
  )
}
