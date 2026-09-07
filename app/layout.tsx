import "./globals.css"
import { Lora } from "next/font/google"
import AppShell from "@/components/layout/AppShell"
import { getOptionalUserContext } from "@/lib/auth/session"
import { emptyNavContext, loadNavContext } from "@/lib/loaders/nav"

export const dynamic = "force-dynamic"

const editorial = Lora({
  subsets: ["latin"],
  variable: "--font-editorial",
  display: "swap",
  fallback: ["Georgia", "Cambria", "Times New Roman", "serif"],
})

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userContext = await getOptionalUserContext()
  const user = userContext?.user ?? null

  const navContext = userContext
    ? await loadNavContext(
        userContext.supabase,
        userContext.user.id,
        userContext.role
      )
    : emptyNavContext

  return (
    <html lang="en" className={editorial.variable}>
      <body>
        <AppShell
          isSignedIn={Boolean(user)}
          accountLabel={user?.email}
          overduePracticeCount={navContext.overduePracticeCount}
          unreadTotalCount={navContext.unreadTotalCount}
          socialAttentionCount={navContext.socialAttentionCount}
          pendingModerationCount={navContext.pendingModerationCount}
          canModerate={navContext.canModerate}
          canAccessDev={navContext.canAccessDev}
        >
          {children}
        </AppShell>
      </body>
    </html>
  )
}
