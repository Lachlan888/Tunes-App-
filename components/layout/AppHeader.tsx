import DesktopNav from "@/components/layout/DesktopNav"
import MobileNav from "@/components/layout/MobileNav"

type AppHeaderProps = {
  isSignedIn: boolean
  overduePracticeCount: number
  unreadTotalCount: number
  pendingModerationCount: number
  canModerate: boolean
}

export default function AppHeader({
  isSignedIn,
  overduePracticeCount,
  unreadTotalCount,
  pendingModerationCount,
  canModerate,
}: AppHeaderProps) {
  return (
    <header className="relative z-[100] border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-3 px-4 py-4 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-4 md:px-6">
        <div className="min-w-0">
          <p className="font-serif text-xl font-bold tracking-tight text-foreground">
            Tunes App
          </p>
          <p className="text-xs font-medium text-muted-foreground">
            Remember, organise, and share tunes.
          </p>
        </div>

        <DesktopNav
          isSignedIn={isSignedIn}
          overduePracticeCount={overduePracticeCount}
          unreadTotalCount={unreadTotalCount}
          pendingModerationCount={pendingModerationCount}
          canModerate={canModerate}
        />

        <MobileNav
          isSignedIn={isSignedIn}
          overduePracticeCount={overduePracticeCount}
          unreadTotalCount={unreadTotalCount}
          pendingModerationCount={pendingModerationCount}
          canModerate={canModerate}
        />
      </div>
    </header>
  )
}