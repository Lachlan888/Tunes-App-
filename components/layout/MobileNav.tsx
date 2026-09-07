"use client"

import NavigationDock from "@/components/layout/NavigationDock"

export default function MobileNav({
  pathname,
  overduePracticeCount,
  socialAttentionCount,
}: {
  pathname: string
  overduePracticeCount: number
  socialAttentionCount: number
}) {
  return (
    <NavigationDock
      key={pathname}
      pathname={pathname}
      overduePracticeCount={overduePracticeCount}
      socialAttentionCount={socialAttentionCount}
    />
  )
}
