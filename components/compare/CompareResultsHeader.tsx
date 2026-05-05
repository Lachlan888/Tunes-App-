import type { ProfileSearchRow } from "@/lib/profile-search"

type CompareResultsHeaderProps = {
  compareHeading: string
  selectedProfiles: ProfileSearchRow[]
  mutualPiecesCount: number
  isAcceptedFriend: boolean
}

function getProfileDisplayName(profile: ProfileSearchRow) {
  return profile.display_name || profile.username || "this player"
}

export default function CompareResultsHeader({
  selectedProfiles,
  mutualPiecesCount,
}: CompareResultsHeaderProps) {
  const comparedNames = selectedProfiles.map(getProfileDisplayName)

  const groupLabel =
    comparedNames.length === 0
      ? "this group"
      : comparedNames.length === 1
        ? comparedNames[0]
        : comparedNames.join(", ")

  return (
    <header className="mb-5 rounded-2xl border border-border bg-background/70 p-4">
      <h2 className="text-lg font-semibold text-foreground">
        {mutualPiecesCount} tune{mutualPiecesCount === 1 ? "" : "s"} in common
        with {groupLabel}
      </h2>
    </header>
  )
}