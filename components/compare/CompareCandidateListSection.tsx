import Link from "next/link"
import SubmitButton from "@/components/SubmitButton"
import PendingLinkButton from "@/components/PendingLinkButton"
import { sendFriendRequest } from "@/lib/actions/friends"
import type { ProfileSearchRow, RankedProfileMatch } from "@/lib/profile-search"
import {
  buildCompareHref,
  removeUserOnce,
  renderProfileLink,
} from "@/lib/compare-page"

type CompareCandidateProfile = ProfileSearchRow | RankedProfileMatch

type CompareCandidateListSectionProps = {
  title: string
  description: string
  profiles: CompareCandidateProfile[]
  primarySearchValue: string
  filterPreservedUsers: string[]
  redirectTo: string
}

export default function CompareCandidateListSection({
  title,
  description,
  profiles,
  primarySearchValue,
  filterPreservedUsers,
  redirectTo,
}: CompareCandidateListSectionProps) {
  if (profiles.length === 0) {
    return null
  }

  return (
    <section className="mb-8 rounded border p-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-gray-600">{description}</p>

      <div className="mt-4 space-y-3">
        {profiles.map((profile) => {
          const nextUsers = [
            ...removeUserOnce(filterPreservedUsers, primarySearchValue),
            profile.username ?? "",
          ].filter(Boolean)

          const label = profile.display_name || profile.username || "Unnamed user"

          return (
            <div
              key={profile.id}
              className="flex items-center justify-between rounded border p-3"
            >
              <div>
                <p className="font-medium">
                  {renderProfileLink(profile.username, label)}
                </p>

                {profile.username && (
                  <p className="text-sm text-gray-600">
                    <Link
                      href={`/users/${profile.username}`}
                      className="underline hover:no-underline"
                    >
                      @{profile.username}
                    </Link>
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                {profile.username ? (
                  <PendingLinkButton
                    href={buildCompareHref(nextUsers)}
                    label="Add to compare"
                    pendingLabel="Loading..."
                    className="rounded bg-black px-3 py-2 text-sm text-white"
                  />
                ) : (
                  <span className="text-sm text-gray-500">
                    No username available
                  </span>
                )}

                <form action={sendFriendRequest}>
                  <input type="hidden" name="addressee_id" value={profile.id} />
                  <input type="hidden" name="redirect_to" value={redirectTo} />
                  <SubmitButton
                    label="Send request"
                    pendingLabel="Sending..."
                    className="rounded border px-3 py-2 text-sm"
                  />
                </form>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}