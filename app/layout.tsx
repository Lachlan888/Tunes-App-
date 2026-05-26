import "./globals.css"
import FloatingFeedbackButton from "@/components/feedback/FloatingFeedbackButton"
import AppHeader from "@/components/layout/AppHeader"
import { emptyNavContext, loadNavContext } from "@/lib/loaders/nav"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const navContext = user
    ? await loadNavContext(supabase, user.id)
    : emptyNavContext

  return (
    <html lang="en">
      <body>
        <AppHeader
          isSignedIn={Boolean(user)}
          overduePracticeCount={navContext.overduePracticeCount}
          unreadTotalCount={navContext.unreadTotalCount}
          pendingFriendRequestCount={navContext.pendingFriendRequestCount}
          socialAttentionCount={navContext.socialAttentionCount}
          pendingModerationCount={navContext.pendingModerationCount}
          canModerate={navContext.canModerate}
          canAccessDev={navContext.canAccessDev}
        />

        {children}

        {user ? <FloatingFeedbackButton /> : null}
      </body>
    </html>
  )
}
