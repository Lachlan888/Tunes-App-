"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"
import { navItemIsActive } from "@/components/layout/navItems"

type NavDropdownItem = {
  href: string
  label: string
  badgeCount?: number
}

type NavDropdownProps = {
  label: string
  items: NavDropdownItem[]
  badgeCount?: number
}

function NavBadge({ count }: { count: number }) {
  if (count <= 0) return null

  return (
    <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 py-0.5 text-xs font-semibold leading-none text-destructive-foreground">
      {count > 99 ? "99+" : count}
    </span>
  )
}

export default function NavDropdown({
  label,
  items,
  badgeCount = 0,
}: NavDropdownProps) {
  const router = useRouter()
  const pathname = usePathname()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const isActive = items.some((item) => navItemIsActive(pathname, item.href))

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current) return

      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  function handleNavigate(href: string) {
    if (isPending || pathname === href) return

    setIsOpen(false)

    startTransition(() => {
      router.push(href)
    })
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] ${
          isActive
            ? "border-primary bg-primary text-primary-foreground shadow-sm"
            : "border-transparent text-foreground hover:border-border hover:bg-muted"
        }`}
      >
        <span>{isPending ? "Loading..." : `${label} ▾`}</span>
        <NavBadge count={badgeCount} />
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute left-0 z-50 mt-2 min-w-44 rounded-2xl border border-border bg-card p-2 shadow-lg"
        >
          {items.map((item) => {
            const itemIsActive = navItemIsActive(pathname, item.href)

            return (
              <button
                key={item.href}
                type="button"
                role="menuitem"
                disabled={isPending || itemIsActive}
                aria-current={itemIsActive ? "page" : undefined}
                onClick={() => handleNavigate(item.href)}
                className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-70 ${
                  itemIsActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                }`}
              >
                <span>{item.label}</span>
                <NavBadge count={item.badgeCount ?? 0} />
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
