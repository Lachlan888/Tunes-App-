import { requireModerator } from "@/lib/auth/roles"

export default async function InternalRouteLayout({ children }: { children: React.ReactNode }) {
  await requireModerator()
  return children
}
