import Link from "next/link"
import PendingLinkButton from "@/components/PendingLinkButton"
import type { ProfileSearchRow } from "@/lib/profile-search"
import {
  buildCompareHref,
  removeUserOnce,
  renderProfileLink,
} from "@/lib/compare-page"

type CurrentCompareGroupSectionProps = {
  selectedProfiles: ProfileSearchRow[]
  filterPreservedUsers: string[]
  titleQuery: string
  selectedKeys: string[]
  selectedStyles: string[]
  selectedTimeSignatures: string[]
}

export default function CurrentCompareGroupSection({
  selectedProfiles,
  filterPreservedUsers,
  titleQuery,
  selectedKeys,
  selectedStyles,
  selectedTimeSignatures,
}: CurrentCompareGroupSectionProps) {
  return (
    <section className="mb-8 rounded border p-4">
      <h2 className="text-xl font-semibold">Current group</h2>
      <p className="mt-1 text-sm text-gray-600">
        You are always included. Add other players to find tunes common to the
        whole group.
      </p>

      {selectedProfiles.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedProfiles.map((profile) => {
            const name = profile.display_name || profile.username
            const nextUsers = removeUserOnce(
              filterPreservedUsers,
              profile.username ?? ""
            )

            return (
              <div
                key={profile.id}
                className="flex items-center gap-2 rounded-full border px-3 py-2 text-sm"
              >
                <span>{renderProfileLink(profile.username, name)}</span>

                {profile.username && (
                  <Link
                    href={`/users/${profile.username}`}
                    className="text-gray-500 underline hover:no-underline"
                  >
                    @{profile.username}
                  </Link>
                )}

                {profile.username && (
                  <PendingLinkButton
                    href={buildCompareHref(nextUsers, {
                      q: titleQuery,
                      key: selectedKeys,
                      style: selectedStyles,
                      time_signature: selectedTimeSignatures,
                    })}
                    label="Remove"
                    pendingLabel="Removing..."
                    className="rounded border px-2 py-1 text-xs"
                  />
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <p className="mt-4 text-sm text-gray-600">
          No confirmed users in the group yet.
        </p>
      )}
    </section>
  )
}