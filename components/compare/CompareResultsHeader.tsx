import Link from "next/link"
import type { ProfileSearchRow } from "@/lib/profile-search"

type CompareResultsHeaderProps = {
  compareHeading: string
  selectedProfiles: ProfileSearchRow[]
  mutualPiecesCount: number
  isAcceptedFriend: boolean
}

export default function CompareResultsHeader({
  compareHeading,
  selectedProfiles,
  mutualPiecesCount,
  isAcceptedFriend,
}: CompareResultsHeaderProps) {
  return (
    <div className="mb-6 rounded border p-4">
      <h2 className="text-xl font-semibold">{compareHeading}</h2>

      {selectedProfiles.length === 1 ? (
        <p className="mt-1 text-sm text-gray-600">
          User:{" "}
          <Link
            href={`/users/${selectedProfiles[0]?.username}`}
            className="underline hover:no-underline"
          >
            {selectedProfiles[0]?.display_name || selectedProfiles[0]?.username}
          </Link>{" "}
          (
          <Link
            href={`/users/${selectedProfiles[0]?.username}`}
            className="underline hover:no-underline"
          >
            @{selectedProfiles[0]?.username}
          </Link>
          )
        </p>
      ) : (
        <p className="mt-1 text-sm text-gray-600">
          Group: you,{" "}
          {selectedProfiles.map((profile, index) => (
            <span key={profile.id}>
              {index > 0 ? ", " : ""}
              {profile.username ? (
                <Link
                  href={`/users/${profile.username}`}
                  className="underline hover:no-underline"
                >
                  {profile.display_name || profile.username}
                </Link>
              ) : (
                profile.display_name || profile.username
              )}
            </span>
          ))}
        </p>
      )}

      {selectedProfiles.length === 1 && !isAcceptedFriend && (
        <p className="mt-2 text-sm text-gray-600">
          Compare is public for this user, so you do not need to be friends to
          view overlap.
        </p>
      )}

      <p className="mt-2 text-sm text-gray-700">
        {mutualPiecesCount} mutual tune{mutualPiecesCount === 1 ? "" : "s"} found.
      </p>
    </div>
  )
}