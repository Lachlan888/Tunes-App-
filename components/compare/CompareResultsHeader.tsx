import UserIdentityLink from "@/components/UserIdentityLink"
import type { ProfileSearchRow } from "@/lib/profile-search"

type CompareResultsHeaderProps = {
  compareHeading: string
  selectedProfiles: ProfileSearchRow[]
  mutualPiecesCount: number
  isAcceptedFriend: boolean
}

export default function CompareResultsHeader({
  selectedProfiles,
  mutualPiecesCount,
}: CompareResultsHeaderProps) {
  return (
    <header className="mb-5 rounded-2xl border border-border bg-background/70 p-4">
      <h2 className="text-lg font-semibold text-foreground">
        {mutualPiecesCount} tune{mutualPiecesCount === 1 ? "" : "s"} in common
        with{" "}
        {selectedProfiles.length === 0 ? (
          "this group"
        ) : selectedProfiles.length === 1 ? (
          <UserIdentityLink
            username={selectedProfiles[0].username}
            displayName={selectedProfiles[0].display_name}
            fallbackLabel="this player"
            className="underline underline-offset-4 transition hover:text-primary"
          />
        ) : (
          selectedProfiles.map((profile, index) => (
            <span key={profile.id}>
              {index > 0 ? ", " : ""}
              <UserIdentityLink
                username={profile.username}
                displayName={profile.display_name}
                fallbackLabel="this player"
                className="underline underline-offset-4 transition hover:text-primary"
              />
            </span>
          ))
        )}
      </h2>
    </header>
  )
}