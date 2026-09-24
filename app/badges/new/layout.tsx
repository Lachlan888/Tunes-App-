import { requireUserContext } from "@/lib/auth/session"

export default async function BadgeAuthoringLayout({ children }: { children: React.ReactNode }) {
  await requireUserContext()
  return children
}
