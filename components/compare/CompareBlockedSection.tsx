import Link from "next/link"
import SubmitButton from "@/components/SubmitButton"
import { sendFriendRequest } from "@/lib/actions/friends"
import type { ProfileSearchRow } from "@/lib/profile-search"
import { renderProfileLink } from "@/lib/compare-page"

type CompareBlockedSectionProps = {
  matchedProfile: ProfileSearchRow
  isAcceptedFriend: boolean
  redirectTo: string
}

export default function CompareBlockedSection({
  matchedProfile,
  isAcceptedFriend,
  redirectTo,
}: CompareBlockedSectionProps) {
  return (
    <section className="mb-8 rounded border p-4">
      <h2 className="text-xl font-semibold">User found</h2>

      <div className="mt-4 flex items-center justify-between rounded border p-4">
        <div>
          <p className="font-medium">
            {renderProfileLink(
              matchedProfile.username,
              matchedProfile.display_name || matchedProfile.username
            )}
          </p>

          <p className="mt-1 text-sm text-gray-600">
            <Link
              href={`/users/${matchedProfile.username}`}
              className="underline hover:no-underline"
            >
              @{matchedProfile.username}
            </Link>
          </p>
        </div>

        {!isAcceptedFriend && (
          <form action={sendFriendRequest}>
            <input type="hidden" name="addressee_id" value={matchedProfile.id} />
            <input type="hidden" name="redirect_to" value={redirectTo} />
            <SubmitButton
              label="Send request"
              pendingLabel="Sending..."
              className="rounded border px-3 py-2 text-sm"
            />
          </form>
        )}
      </div>

      <p className="mt-3 text-sm text-gray-600">
        This user requires friendship before others can compare with them.
      </p>
    </section>
  )
}