import type { ReactNode, SVGProps } from "react"

export type IconName =
  | "alert"
  | "arrow-left"
  | "badge"
  | "book"
  | "check"
  | "clock"
  | "code"
  | "compare"
  | "feedback"
  | "help"
  | "home"
  | "inbox"
  | "info"
  | "list"
  | "metronome"
  | "music"
  | "practice"
  | "rough"
  | "search"
  | "setlist"
  | "settings"
  | "shaky"
  | "shield"
  | "social"
  | "stage"
  | "trend"
  | "trash"
  | "user"
  | "x"

type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  name: IconName
  size?: number
}

export default function Icon({
  name,
  size = 18,
  className,
  ...props
}: IconProps) {
  const paths: Record<IconName, ReactNode> = {
    alert: (
      <>
        <path d="M12 3 2.8 19a2 2 0 0 0 1.73 3h14.94a2 2 0 0 0 1.73-3Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </>
    ),
    "arrow-left": (
      <>
        <path d="m15 18-6-6 6-6" />
        <path d="M9 12h10" />
      </>
    ),
    badge: (
      <>
        <circle cx="12" cy="9" r="5" />
        <path d="m8.5 13-1 8 4.5-2 4.5 2-1-8" />
      </>
    ),
    book: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5Z" />
        <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5Z" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    code: <path d="m8 9-4 3 4 3m8-6 4 3-4 3m-2-9-4 12" />,
    compare: (
      <>
        <path d="M7 7h12l-3-3m3 3-3 3" />
        <path d="M17 17H5l3 3m-3-3 3-3" />
      </>
    ),
    feedback: (
      <>
        <path d="M5 5h14v11H9l-4 3Z" />
        <path d="M9 9h6M9 12h4" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.8 9a2.4 2.4 0 1 1 3 2.3c-.8.3-.8 1-.8 1.7" />
        <path d="M12 17h.01" />
      </>
    ),
    home: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10M9 20v-6h6v6" />
      </>
    ),
    inbox: (
      <>
        <path d="M4 4h16v16H4Z" />
        <path d="M4 14h5l1.5 2h3l1.5-2h5" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6" />
        <path d="M12 7h.01" />
      </>
    ),
    list: (
      <>
        <path d="M9 6h11M9 12h11M9 18h11" />
        <path d="M4 6h.01M4 12h.01M4 18h.01" />
      </>
    ),
    metronome: (
      <>
        <path d="M9 20h6M6 20 11 4h2l5 16" />
        <path d="m12 4 4 8M10 14h4" />
      </>
    ),
    music: (
      <>
        <path d="M9 18V5l10-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="16" cy="16" r="3" />
      </>
    ),
    practice: (
      <>
        <path d="M4 12a8 8 0 1 0 3-6" />
        <path d="M4 4v5h5" />
        <path d="M12 8v4l3 2" />
      </>
    ),
    rough: <path d="M3 14 7 9l4 6 4-8 6 5" />,
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    setlist: (
      <>
        <path d="M6 4h12v16H6Z" />
        <path d="M9 8h6M9 12h6M9 16h4" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a8 8 0 0 0-1.8-1L14.5 3h-5l-.2 3a8 8 0 0 0-1.8 1L5 6 3 9.5 5.1 11a7 7 0 0 0 0 2L3 14.5 5 18l2.5-1a8 8 0 0 0 1.8 1l.2 3h5l.2-3a8 8 0 0 0 1.8-1l2.5 1 2-3.5-2.1-1.5a7 7 0 0 0 .1-1Z" />
      </>
    ),
    shaky: (
      <>
        <path d="M4 12h3l2-4 3 8 2-4h6" />
        <path d="M4 19h16" strokeDasharray="2 3" />
      </>
    ),
    shield: <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6Z" />,
    social: (
      <>
        <circle cx="9" cy="9" r="3" />
        <circle cx="17" cy="8" r="2" />
        <path d="M3 20a6 6 0 0 1 12 0" />
        <path d="M14 15a5 5 0 0 1 7 4" />
      </>
    ),
    stage: (
      <>
        <path d="M4 18V9" />
        <path d="M10 18V5" />
        <path d="M16 18V12" />
        <path d="M22 18H2" />
      </>
    ),
    trend: (
      <>
        <path d="m4 17 5-5 4 3 7-8" />
        <path d="M15 7h5v5" />
      </>
    ),
    trash: (
      <>
        <path d="M4 7h16" />
        <path d="M9 7V4h6v3" />
        <path d="m6 7 1 14h10l1-14" />
        <path d="M10 11v6M14 11v6" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    x: <path d="m6 6 12 12M18 6 6 18" />,
  }

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      {paths[name]}
    </svg>
  )
}
