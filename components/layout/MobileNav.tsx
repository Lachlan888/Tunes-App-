"use client"

import { useState, useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"
import LogoutButton from "@/components/LogoutButton"

type MobileNavProps = {
  isSignedIn: boolean
  overduePracticeCount: number
  unreadTotalCount: number
  pendingModerationCount: number
  canModerate: boolean
}

type MobileNavItem = {
  href: string
  label: string
  badgeCount?: number
}

type OpenPanel = "social" | "more" | null

function FloatingBadge({ count }: { count: number }) {
  if (count <= 0) return null

  return (
    <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-destructive px-1 py-0.5 text-[0.65rem] font-semibold leading-none text-destructive-foreground shadow-sm">
      {count > 99 ? "99+" : count}
    </span>
  )
}

function InlineBadge({ count }: { count: number }) {
  if (count <= 0) return null

  return (
    <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 py-0.5 text-[0.65rem] font-semibold leading-none text-destructive-foreground">
      {count > 99 ? "99+" : count}
    </span>
  )
}

function MobileNavButton({
  label,
  badgeCount = 0,
  isActive,
  isPending,
  disableWhenActive = true,
  onClick,
}: {
  label: string
  badgeCount?: number
  isActive?: boolean
  isPending?: boolean
  disableWhenActive?: boolean
  onClick: () => void
}) {
  const isDisabled = Boolean(isPending || (disableWhenActive && isActive))

  return (
    <button
      type="button"
      disabled={isDisabled}
      aria-current={isActive ? "page" : undefined}
      onClick={onClick}
      className={`relative flex min-h-9 min-w-0 items-center justify-center rounded-full border px-1.5 text-[0.78rem] font-semibold leading-none transition disabled:cursor-not-allowed disabled:opacity-70 ${
        isActive
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-transparent text-foreground hover:border-border hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
      }`}
    >
      <span className="whitespace-nowrap">{isPending ? "Loading" : label}</span>
      <FloatingBadge count={badgeCount} />
    </button>
  )
}

function MobilePanel({
  title,
  items,
  isPending,
  pathname,
  onNavigate,
  children,
}: {
  title: string
  items: MobileNavItem[]
  isPending: boolean
  pathname: string
  onNavigate: (href: string) => void
  children?: React.ReactNode
}) {
  return (
    <div className="mt-2 rounded-2xl border border-border bg-card p-2 shadow-lg">
      <div className="mb-2 px-2 pt-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </div>

      <div className="grid grid-cols-2 gap-1">
        {items.map((item) => {
          const itemIsActive = pathname === item.href

          return (
            <button
              key={item.href}
              type="button"
              disabled={isPending || itemIsActive}
              aria-current={itemIsActive ? "page" : undefined}
              onClick={() => onNavigate(item.href)}
              className={`flex min-h-10 items-center justify-between gap-2 rounded-xl px-3 text-left text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-70 ${
                itemIsActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              }`}
            >
              <span className="truncate">{item.label}</span>
              <InlineBadge count={item.badgeCount ?? 0} />
            </button>
          )
        })}
      </div>

      {children ? (
        <div className="mt-2 border-t border-border pt-2">{children}</div>
      ) : null}
    </div>
  )
}

export default function MobileNav({
  isSignedIn,
  overduePracticeCount,
  unreadTotalCount,
  pendingModerationCount,
  canModerate,
}: MobileNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null)

  const socialItems: MobileNavItem[] = [
    {
      href: "/friends",
      label: "Friends",
    },
    {
      href: "/inbox",
      label: "Inbox",
      badgeCount: unreadTotalCount,
    },
    {
      href: "/compare",
      label: "Compare",
    },
    {
      href: "/public-lists",
      label: "Shared",
    },
    {
      href: "/setlists",
      label: "Setlists",
    },
    {
      href: "/badges",
      label: "Badges",
    },
  ]

  const moreItems: MobileNavItem[] = [
    {
      href: "/learning-lists",
      label: "Lists",
    },
    {
      href: "/trends",
      label: "Trends",
    },
    ...(canModerate
      ? [
          {
            href: "/moderator",
            label: "Moderator",
            badgeCount: pendingModerationCount,
          },
        ]
      : []),
    {
      href: "/dashboard",
      label: "Profile",
    },
  ]

  const socialIsActive = socialItems.some((item) => pathname === item.href)
  const moreIsActive = moreItems.some((item) => pathname === item.href)

  function handleNavigate(href: string) {
    if (isPending || pathname === href) return

    setOpenPanel(null)

    startTransition(() => {
      router.push(href)
    })
  }

  function togglePanel(panel: Exclude<OpenPanel, null>) {
    setOpenPanel((current) => (current === panel ? null : panel))
  }

  if (!isSignedIn) {
    return (
      <nav className="md:hidden">
        <div className="grid grid-cols-1 gap-1 text-sm">
          <MobileNavButton
            label="Login"
            isActive={pathname === "/login"}
            isPending={isPending}
            onClick={() => handleNavigate("/login")}
          />
        </div>
      </nav>
    )
  }

  return (
    <nav className="md:hidden">
      <div className="grid grid-cols-[1fr_1.2fr_1fr_1fr_1fr] gap-1 text-sm">
        <MobileNavButton
          label="Home"
          isActive={pathname === "/"}
          isPending={isPending}
          onClick={() => handleNavigate("/")}
        />

        <MobileNavButton
          label="Practice"
          badgeCount={overduePracticeCount}
          isActive={pathname === "/review"}
          isPending={isPending}
          onClick={() => handleNavigate("/review")}
        />

        <MobileNavButton
          label="Tunes"
          isActive={pathname === "/library"}
          isPending={isPending}
          onClick={() => handleNavigate("/library")}
        />

        <MobileNavButton
          label={openPanel === "social" ? "Close" : "Social"}
          badgeCount={unreadTotalCount}
          isActive={socialIsActive || openPanel === "social"}
          isPending={false}
          disableWhenActive={false}
          onClick={() => togglePanel("social")}
        />

        <MobileNavButton
          label={openPanel === "more" ? "Close" : "More"}
          isActive={moreIsActive || openPanel === "more"}
          isPending={false}
          disableWhenActive={false}
          onClick={() => togglePanel("more")}
        />
      </div>

      {openPanel === "social" ? (
        <MobilePanel
          title="Social"
          items={socialItems}
          isPending={isPending}
          pathname={pathname}
          onNavigate={handleNavigate}
        />
      ) : null}

      {openPanel === "more" ? (
        <MobilePanel
          title="More"
          items={moreItems}
          isPending={isPending}
          pathname={pathname}
          onNavigate={handleNavigate}
        >
          <LogoutButton />
        </MobilePanel>
      ) : null}
    </nav>
  )
}