import { requireAppAdmin } from "@/lib/auth/roles"

export default async function InternalRouteLayout({ children }: { children: React.ReactNode }) {
  await requireAppAdmin()
  return children
}
